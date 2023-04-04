import { InternalDiscordGatewayAdapterCreator, Message, TextChannel, VoiceBasedChannel, VoiceChannel } from "discord.js";
import { AudioPlayer, AudioReceiveStream, EndBehaviorType, StreamType, VoiceConnection, createAudioPlayer, createAudioResource, joinVoiceChannel } from "@discordjs/voice";
import { OpusEncoder } from "@discordjs/opus";
import ICommand from "../../interface/ICommand";
import { ClassLogger } from "../../logging/Logger";
import { sleep } from "../../utils/Utils";
import fs from "fs";
import wav from "wav";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import synthetize from "../../fragment/GoogleSynthetizer";
import { Readable } from "stream";
import { sendMessageAndPoll } from "../../fragment/ChatGpt";

/* ==== PROPERTIES ============================================================================== */
const logger: ClassLogger = new ClassLogger(null as any, __filename);

// A registration must last at least {MIN_DURATION} milliseconds in order to be saved and read
const MIN_DURATION: number = 1500;
const SILENCE_MAX_DURATION: number = 250;

// Store servers data so that multiple can be handled at the same time
export const serverConnectionsMap: Map<string, ServerConnections> = new Map();

// OpusDecoder to read input voice streams and converting them to .wav
const opusEncoder: OpusEncoder = new OpusEncoder(48000, 2);

/* ==== INFO STORAGE CLASS ====================================================================== */
export class ServerConnections {
    constructor () {
        this.userBindings = new Map();
        this.botAudioPlayer = createAudioPlayer();

        this.botAudioPlayer.on("stateChange", (_, newState) => logger.debug("AudioPlayer state changed: " + newState.status));
        this.botAudioPlayer.on("error", err => logger.error("AudioPlayer error: " + err.message));
    }

    botVoiceConnection: VoiceConnection | undefined;
    botAudioPlayer: AudioPlayer;
    userBindings: Map<string, TextChannel>;

    cleanUser(userId: string, callback?: (...args: any) => any): void {
        if(callback) callback();
        this.userBindings.delete(userId);
        if(this.userBindings.size === 0) {
            if(this.botVoiceConnection) this.botVoiceConnection.destroy();
            this.botVoiceConnection = undefined;
        }
    }
}

/* ==== UTILS =================================================================================== */
const isListeningActive = (userId: string, guildId: string) => {

    // Check if the serverConnections object still exists
    const serverConnections: ServerConnections | undefined = serverConnectionsMap.get(guildId);
    if(!serverConnections) return false;

    // Check if the user still wants to be listened
    if(!serverConnections.userBindings.has(userId)) return false;

    return true;
}

/* ==== COMMAND ================================================================================= */
export const listenCommand: ICommand = {
    name: "listen",
    fn: async (msg: Message) => {

        // Command only valid in normal text chanels
        if(!(msg.channel instanceof TextChannel)) return;

        // Check if user is actuallt in a voice channel
        const userVoiceChannel: VoiceBasedChannel = msg.member?.voice.channel as VoiceBasedChannel;
        if(!userVoiceChannel) return msg.reply("Come cazzo dovrei sentirti??");

        const userId: string = msg.member?.id as string;
        const channelId: string = msg.member?.voice.channelId as string;
        const guildId: string = msg.guildId as string;

        // Check if a ServerConnections object has already been created for this server
        const serverConnections: ServerConnections = serverConnectionsMap.get(guildId) ?? new ServerConnections();
        serverConnectionsMap.set(guildId, serverConnections);

        // Check if a voice connection has already been created for this server
        const botVoiceConnection: VoiceConnection = serverConnections.botVoiceConnection ?? joinVoiceChannel({ selfDeaf: false, channelId, guildId, adapterCreator: msg.guild?.voiceAdapterCreator as InternalDiscordGatewayAdapterCreator });
        serverConnections.botVoiceConnection = botVoiceConnection;

        // Bind the user to the text channel he wants the transcriptions in
        // If the user was already bound, just save the new channel without creating another process
        const alreadyBound: boolean = serverConnections.userBindings.has(userId);
        serverConnections.userBindings.set(userId, msg.channel);
        if(alreadyBound) return;

        // Start listening to the user voice until the check fails (isListeningActive() === false)
        // Init loop properties
        let startTimestamp: number | null;
        let listening: boolean;
        let textChannel: TextChannel;
        do {
            // Reset loop properties
            startTimestamp = null;
            listening = true;
    
            // If the user binding is removed during the transcription, the message won't be sent
            textChannel = serverConnections.userBindings.get(userId) as TextChannel;
            if(!textChannel) return serverConnections.cleanUser(userId);
            if(!userVoiceChannel.members.has(userId)) return serverConnections.cleanUser(userId, () => textChannel.send("Scemo ti sto parlando, dove cazzo vai?"));

            // Retrieve user voice as a stream of opus packets
            const userInputStream: AudioReceiveStream = botVoiceConnection.receiver.subscribe(userId, { end: { behavior: EndBehaviorType.AfterSilence, duration: SILENCE_MAX_DURATION } });
            logger.debug("UserInputStream created! Listening...");

            // Tell the user that the bot is "transcribing"
            textChannel.sendTyping();

            // Create a WAV writable stream to correctly parse the decoded data to write in the file
            const wavStream = new wav.Writer({ sampleRate: 48000, channels: 2, bitDepth: 16 });
      
            // Define the behaviour of the stream when a packet (buffer) is received
            // Each packet will be decoded from the OpusEncoder and sent to the wavStream
            // The first time a packet is received, start a timer to check the audio duration
            userInputStream.on("data", data => {
                if(!startTimestamp) startTimestamp = Date.now();   
                wavStream.push( opusEncoder.decode(data) );
            });

            // Define the behaviour of the stream when it closes
            // The event is emitted when the user stops talking or he or the bot is disconnected
            userInputStream.on("close", () => {

                // The "lock" (listening flag) on the user will be lifted and a new stream can be read
                listening = false;

                // If the duration of the audio that would be created is too short, trash it
                const duration: number = Date.now() - (startTimestamp as number);
                if(duration < MIN_DURATION) return logger.debug(`Trashing recording of ${MIN_DURATION} ms`);

                // Create a writable stream to save the WAV file (piping wavStream) to disk
                const outWavPath: string = `./out/${userId}.${startTimestamp}.wav`;
                const outputStream = fs.createWriteStream(outWavPath);
                wavStream.pipe(outputStream);

                // Define the behaviour of the stream when the file is ready
                outputStream.on("ready", () => {
                    logger.info(`Recording of ${duration}ms completed and saved to ${outWavPath}`);

                    // Transcribe the content spawning a python child process
                    // TODO: use spawnSync
                    const pyProcess: ChildProcessWithoutNullStreams = spawn("python3", ["./transcribe.py", outWavPath]);
                    pyProcess.stdout.on("data", async data => {

                        // Since the data is returned as a buffer, a conversion to edible utf8 is needed
                        let result: string = data.toString("utf8");

                        // The result of the child process will be sent in the channel bound to the user
                        if(!result || result.length === 1) return textChannel.send(`Non ho capito un cazzo di quello che hai detto, **${msg.member?.nickname}**...`);
                        const messageSent: Message = await textChannel.send(`**${msg.member?.nickname}**: ${result}`);

                        // Delete the audio file once it has been transcribed
                        fs.unlink(outWavPath, () => logger.info("Recording processed and unlinked"));

                        // TEMPORARY - Read the transcription out loud in the voice channel
                        // TODO: synthetize ChatGPT response
                        const chatResponse: string[] = await sendMessageAndPoll(result);
                        const stream: Readable = await synthetize(chatResponse[0], "en");
                        // const stream: Readable = await synthetize(result, "en");

                        messageSent.reply(chatResponse[0]);
                        const resource = createAudioResource(stream, { inlineVolume: true, inputType: StreamType.Arbitrary });

                        serverConnections.botAudioPlayer.play(resource);
                        serverConnections.botVoiceConnection?.subscribe(serverConnections.botAudioPlayer);
                    });
                });
            })
    
            // Don't check again if the input stream is still open ("lock")
            while(listening) await sleep(1000);

        // Once the audio has been transcribed, check if the user wants more - if so, repeat
        } while( isListeningActive(userId, guildId) );
    }
}
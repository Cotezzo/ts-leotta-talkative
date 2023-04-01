import { InternalDiscordGatewayAdapterCreator, Message } from "discord.js";
import { AudioReceiveStream, EndBehaviorType, VoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { OpusEncoder } from "@discordjs/opus";
import ICommand from "../../interface/ICommand";
import { ClassLogger } from "../../logging/Logger";
import { sleep } from "../../utils/Utils";
import fs from "fs";
import wav from "wav";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";

/* ==== PROPERTIES ============================================================================== */
const logger: ClassLogger = new ClassLogger(null as any, __filename);

// A registration must last at least {MIN_DURATION} milliseconds in order to be saved and read
const MIN_DURATION: number = 1000;

// Store servers data so that multiple can be handled at the same time
const ServerConnectionsMap: Map<string, ServerConnections> = new Map();

// OpusDecoder to read input voice streams and converting them to .wav
const opusEncoder: OpusEncoder = new OpusEncoder(48000, 2);

/* ==== INFO STORAGE CLASS ====================================================================== */
class ServerConnections {
    constructor () {
        this.userConnectionsMap = new Map();
        this.userListened = new Set();
    }

    botVoiceConnection: VoiceConnection;
    userConnectionsMap: Map<string, AudioReceiveStream>;
    userListened: Set<string>;
}

/* ==== UTILS =================================================================================== */
const isListeningActive = (userId: string, guildId: string) => {

    // Check if the serverConnections object still exists
    const serverConnections: ServerConnections | undefined = ServerConnectionsMap.get(guildId);
    if(!serverConnections) return false;

    // Check if the user still wants to be listened
    if(!serverConnections.userListened.has(userId)) return false;

    return true;
}

/* ==== COMMAND ================================================================================= */
const listenCommand: ICommand = {
    name: "listen",
    fn: async (msg: Message) => {

        // User not in a voice channel: reject
        if(!msg.member?.voice.channel) msg.reply("Come cazzo dovrei sentirti??");

        const userId: string = msg.member?.id as string;
        const channelId: string = msg.channelId;
        const guildId: string = msg.guildId as string;

        // Check if a ServerConnections object has already been created for this server
        const serverConnections: ServerConnections = ServerConnectionsMap.get(guildId) ?? new ServerConnections();

        // Check if a voice connection has already been created for this server
        const botVoiceConnection: VoiceConnection = serverConnections.botVoiceConnection ?? joinVoiceChannel({ selfDeaf: false, channelId, guildId, adapterCreator: msg.guild?.voiceAdapterCreator as InternalDiscordGatewayAdapterCreator });

        // Check if a input stream has already been opened for this user
        if(serverConnections.userConnectionsMap.get(userId)) return;

        // Save that this user wants to be listened
        serverConnections.userListened.add(userId);

        // Start listening to the user voice until the check fails (isListeningActive() === false)
        // Init loop properties
        let startTimestamp: number | null;
        let listening: boolean;
        do {
            // Reset loop properties
            startTimestamp = null;
            listening = true;
    
            // Retrieve user voice as a stream of opus packets
            const userInputStream: AudioReceiveStream = botVoiceConnection.receiver.subscribe(userId, { end: { behavior: EndBehaviorType.AfterSilence, duration: 200 } });
            
            // Tell the user that the bot is "transcribing"
            msg.channel.sendTyping();

            // Create a WAV writable stream to correctly parse the decoded data to write in the file
            const wavStream = new wav.Writer({
                sampleRate: 48000,
                channels: 2,
                bitDepth: 16
            });
      
            // Define the behaviour of the stream when a packet (buffer) is received
            // Each packet will be decoded from the OpusEncoder and sent to the wavStream
            // The first time a packet is received, start a timer to check the audio duration
            userInputStream.on("data", data => {
                if(!startTimestamp) startTimestamp = Date.now();   
                wavStream.push( opusEncoder.decode(data) );
            });

            // Define the behaviour of the stream when it closes
            // If the duration of the audio that would be created is too short, trash it
            // Create a writable stream to write the WAV file to disk and pipe the wavStream
            // Once the file is succesfully created, transcribe the content via a child process
            // The result of the python script will be sent in the text channel used for the command
            userInputStream.on("end", () => {
                // To unlock the loop, I free the thread so it can create and listen to the next stream
                listening = false;
    
                // Calculate the audio duration and decide wether to keep it or use it
                const duration: number = Date.now() - (startTimestamp as number);
                logger.info(`Registration completed! Duration: ${duration}ms`);
                if(duration < MIN_DURATION) return logger.warn(`Trashing registration: Duration was less than ${MIN_DURATION}`);
    
                const outWavPath: string = `./out/${userId}.${startTimestamp}.wav`;
                const outputStream = fs.createWriteStream(outWavPath);
    
                outputStream.on("close", () => {
                    // TODO: capire perché l'avvio dello script python non viene triggerato da qui
                 });
    
                wavStream.pipe(outputStream);
    
                logger.info(`Registration completed and saved to ${outWavPath}`);
    
                // TODO: use spawnSync
                const pyProcess: ChildProcessWithoutNullStreams = spawn("python3", ["./transcribe.py", outWavPath]);
                pyProcess.stdout.on("data", data => {
                    msg.channel.send(data);
                })
            })
    
            // Don't check again if the input stream is still open ("lock")
            while(listening) await sleep(100);

        // Once the audio has been transcribed, check if the user wants more - if so, repeat
        } while( isListeningActive(userId, guildId) );
    }
}
export default listenCommand;
import { InternalDiscordGatewayAdapterCreator, VoiceState } from "discord.js";
import { OpusEncoder } from '@discordjs/opus';
import fs from "fs";
import wav from 'wav';
import { ChildProcessWithoutNullStreams, spawn } from "child_process"

import { tsLeottaTalkative } from "..";
import { ClassLogger, Logger } from "../logging/Logger";
import { AudioReceiveStream, EndBehaviorType, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { sleep } from "../utils/Utils";

// OpusDecoder to read input voice streams and converting them to .wav
const opusEncoder: OpusEncoder = new OpusEncoder(48000, 2);
const logger: ClassLogger = new ClassLogger(null as any, __filename);

/* ==== EVENT - voiceStateUpdate ========================================================================= */
export default (_: any, oldState: VoiceState, newState: VoiceState) => {
    // Bot activity: reject
    if(oldState.id === tsLeottaTalkative.user?.id) return;

    logger.debug("Voice event!");
    
    // initInputStream(newState.guild.id, newState.channel?.id as string, newState.member?.id as string, newState.channel?.guild.voiceAdapterCreator as InternalDiscordGatewayAdapterCreator);
}

const MIN_DURATION: number = 1000;  // Minimum registration duration in milliseconds
const initInputStream = async (guildId: string, channelId: string, userId: string, adapterCreator: InternalDiscordGatewayAdapterCreator) => {

    logger.info("Joining voice channel...");
    const botVoiceConnection: VoiceConnection = joinVoiceChannel({ selfDeaf: false, channelId, guildId, adapterCreator });
    logger.info("Successfully joined the voice channel!");

    
    let toggle: boolean = true;
    while(toggle) {
        let startTimestamp: number;
        let listening: boolean = true;

        logger.info("Retrieving user voice stream...");
        const userInputStream: AudioReceiveStream = botVoiceConnection.receiver.subscribe(userId, { end: { behavior: EndBehaviorType.AfterSilence, duration: 200 } });
        logger.info("Listening on user voice!");

        // Create a writable stream to write the WAV file
        const wavStream = new wav.Writer({
            sampleRate: 48000,
            channels: 2,
            bitDepth: 16
        });
  

        userInputStream.on("data", data => {
            // Per ottenere la effettiva durata dell'audio partendo da quando arrivano i pacchetti
            // Mi segno il timestamp del primo pacchetto ricevuto
            if(!startTimestamp) startTimestamp = Date.now();

            const wavBuffer: Buffer = opusEncoder.decode(data);
            
            // logger.info("Wav buffer: " + Buffer.byteLength(wavBuffer));

            // Pipe the Opus stream into the decoder and then into the WAV writer
            wavStream.push( wavBuffer );
        });

        // Listen for when the WAV file has finished writing
        // wavStream.on('close', () => logger.info('WAV file written successfully') );
                
        userInputStream.on("end", () => {
            // To unlock the loop, I free the thread so it can create and listen to the next stream
            listening = false;

            logger.info("TS before duration calc: " + startTimestamp);

            // Calculate the audio duration and decide wether to keep it or use it
            const duration: number = Date.now() - startTimestamp;
            logger.info(`Registration completed! Duration: ${duration}ms`);
            if(duration < 1000) return logger.warn(`Trashing registration: Duration was less than ${MIN_DURATION}`);

            // Create a writable stream to write the WAV file to disk
            const outWavPath: string = `./out/${userId}.${startTimestamp}.wav`;
            const outputStream = fs.createWriteStream(outWavPath);

            outputStream.on("close", () => {
                logger.info(`Registration completed and saved to ${outWavPath}`);

                // Once the file has been written, transcribe the audio
                const pyProcess: ChildProcessWithoutNullStreams = spawn("python3", ["./transcribe.py", outWavPath]);
                pyProcess.on("data", data => {
                    logger.info("Transcribed audio: " + data)
                })
             });

            wavStream.pipe(outputStream);


            logger.info(`Registration completed and saved to ${outWavPath}`);

            // Once the file has been written, transcribe the audio
            const pyProcess: ChildProcessWithoutNullStreams = spawn("python3", ["./transcribe.py", outWavPath]);
            pyProcess.stdout.on("data", data => {
                logger.info("Transcribed audio: " + data)
            })
        })

        while(listening) {
            await sleep(100);
        }
    }
}


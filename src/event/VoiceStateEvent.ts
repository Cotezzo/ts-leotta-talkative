import { InternalDiscordGatewayAdapterCreator, VoiceState } from "discord.js";
import fs from "fs";
import { OpusEncoder } from '@discordjs/opus';
import wav from 'wav';

import { tsLeottaTalkative } from "..";
import { Logger } from "../logging/Logger";
import { AudioReceiveStream, EndBehaviorType, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { sleep } from "../utils/Utils";

// OpusDecoder to read input voice streams and converting them to .wav
const opusEncoder: OpusEncoder = new OpusEncoder(48000, 2);

/* ==== EVENT - voiceStateUpdate ========================================================================= */
export default (_: any, oldState: VoiceState, newState: VoiceState) => {
    // Bot activity: reject
    if(oldState.id === tsLeottaTalkative.user?.id) return;

    Logger.debug("Voice event!");
    
    initInputStream(newState.guild.id, newState.channel?.id as string, newState.member?.id as string, newState.channel?.guild.voiceAdapterCreator as InternalDiscordGatewayAdapterCreator);
}

const initInputStream = async (guildId: string, channelId: string, userId: string, adapterCreator: InternalDiscordGatewayAdapterCreator) => {

    Logger.info("Joining voice channel...");
    const botVoiceConnection: VoiceConnection = joinVoiceChannel({ selfDeaf: false, channelId, guildId, adapterCreator });
    Logger.info("Successfully joined the voice channel!");

    
    let toggle: boolean = true;
    let startTimestamp: number;
    while(toggle) {
        let listening: boolean = true;

        Logger.info("Retrieving user voice stream...");
        const userInputStream: AudioReceiveStream = botVoiceConnection.receiver.subscribe(userId, { end: { behavior: EndBehaviorType.AfterSilence, duration: 200 } });
        startTimestamp = Date.now();
        Logger.info("Listening on user voice!");

        // Create a writable stream to write the WAV file
        const wavStream = new wav.Writer({
            sampleRate: 48000,
            channels: 2,
            bitDepth: 16
        });
  
        // Listen for when the WAV file has finished writing
        wavStream.on('close', () => Logger.info('WAV file written successfully') );

        // Create a writable stream to write the WAV file to disk and pipe the WAV stream to the output file stream
        const outputStream = fs.createWriteStream(`./out/${userId}.${startTimestamp}.wav`);
        wavStream.pipe(outputStream);

        userInputStream.on("data", data => {
            Logger.debug("Opus data packed received!");
            
            // Pipe the Opus stream into the decoder and then into the WAV writer
            wavStream.push( opusEncoder.decode(data) );
        });

        userInputStream.on("end", () => {
            Logger.info(`Registration completed! Duration: ${Date.now() - startTimestamp}ms`)
            listening = false;
        })

        while(listening) await sleep(100);
    }
}


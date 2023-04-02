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

    // TODO: implement something
}
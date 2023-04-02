import { InternalDiscordGatewayAdapterCreator, Message, TextChannel, VoiceBasedChannel, VoiceChannel } from "discord.js";
import { AudioReceiveStream, EndBehaviorType, VoiceConnection, joinVoiceChannel } from "@discordjs/voice";
import { OpusEncoder } from "@discordjs/opus";
import ICommand from "../../interface/ICommand";
import { ClassLogger } from "../../logging/Logger";
import { sleep } from "../../utils/Utils";
import fs from "fs";
import wav from "wav";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { ServerConnections, serverConnectionsMap } from "./ListenCommand";

/* ==== PROPERTIES ============================================================================== */
const logger: ClassLogger = new ClassLogger(null as any, __filename);

/* ==== COMMAND ================================================================================= */
export const unlistenCommand: ICommand = {
    name: "listen",
    fn: async (msg: Message) => {

        // Command only valid in normal text chanels
        if(!(msg.channel instanceof TextChannel)) return;

        const userId: string = msg.member?.id as string;
        const guildId: string = msg.guildId as string;

        // Check if a ServerConnections object has been created for this server
        const serverConnections: ServerConnections | undefined = serverConnectionsMap.get(guildId);
        if(!serverConnections) return;

        // Check if the user wasn't being listened
        if(!serverConnections.userBindings.has(userId)) return;

        // Remove the user binding
        return serverConnections.cleanUser(userId);
    }
}
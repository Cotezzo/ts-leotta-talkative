import TsLeottaTalkative from './config/TsLeottaTalkative';

import dotenv from "dotenv";    // Configure process.env globally
import { GatewayIntentBits, Options } from 'discord.js';
import fs from 'fs';
import { Logger } from './logging/Logger';
dotenv.config();

/* ==== Core ============================================================================================================================== */
export const tsLeottaTalkative: TsLeottaTalkative = new TsLeottaTalkative({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.MessageContent
    ],
    makeCache: Options.cacheWithLimits({
        MessageManager: 0,
        GuildBanManager: 0,
        BaseGuildEmojiManager: 0,
        GuildEmojiManager: 0,
        GuildInviteManager: 0,
        GuildStickerManager: 0,
        ReactionManager: 0,
        ReactionUserManager: 0,
        ApplicationCommandManager: 0,
        PresenceManager: 0,
        StageInstanceManager: 0
    })
});
tsLeottaTalkative.init();

// Output dir cleaning in case the bot crashed in the previous run
const outputDir = "./out/";
fs.readdir(outputDir, (err, files) => {
    for(const file of files) {
        const filePath: string = outputDir + file;
        fs.unlink(filePath, () => tsLeottaTalkative.logger.debug(`${filePath} deleted`));
    }
});
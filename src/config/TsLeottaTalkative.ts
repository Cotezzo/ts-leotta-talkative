import { Client } from 'discord.js';

import { ClassLogger } from '../logging/Logger';
import readyEvent from '../event/ReadyEvent';
import messageCreateEvent from '../event/MessageCreateEvent';
import voiceStateEvent from '../event/VoiceStateEvent';

/* ==== CLASS ================================================================= */
/** Main class that rapresents the bot itself. On init, logs in the bot into Discord and starts to listen on all the events. */
export default class TsLeottaTalkative extends Client {
    public logger: ClassLogger;
    public init = () => {
        const isProd = process.env.ENVIROMENT == "P" ? true : false;

        // Bot login
        this.logger = new ClassLogger(null as any, __filename);
        this.logger.info(`==== Deploy started on enviroment ${isProd ? "PRODUCTION" : "TEST"} ====`);
        this.login(isProd ? process.env.PROD_TOKEN : process.env.TEST_TOKEN);
        
        // On bot login event, execute only once  
        this.once("ready", readyEvent.bind(null, this));
        this.logger.info("Listening on event 'ready'");

        // Event Listeners
        this.on("messageCreate", messageCreateEvent.bind(null, this));
        this.logger.info("Listening on event messageCreate");

        this.on("voiceStateUpdate", voiceStateEvent.bind(null, this));
        this.logger.info("Listening on event voiceStateUpdate");
    }
}
import { ActivityType } from "discord.js";
import { tsLeottaTalkative } from "..";

/* ==== Events ============================================================================================================================ */
export default (): void => {
    tsLeottaTalkative.user?.setPresence({ activities: [{ name: "your voice", type: ActivityType.Listening }], status: 'idle' });
    tsLeottaTalkative.logger.info(`========= Bot deployed on version ${process.env.VERSION} =========`);
}
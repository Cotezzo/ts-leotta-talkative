import { Message } from "discord.js";
import { tsLeottaTalkative } from "../..";
import ICommand from "../../interface/ICommand";

/* ==== COMMAND ================================================================================= */
const pingCommand: ICommand = {
    name: "ping",
    fn: (msg: Message) => msg.reply( `Pxng! (${tsLeottaTalkative.ws.ping}ms)` )
}
export default pingCommand;
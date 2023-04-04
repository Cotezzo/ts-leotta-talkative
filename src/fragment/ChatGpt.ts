import WebSocket from "ws";
import axios from "axios";
import { ClassLogger } from "../logging/Logger";
import IChatInfo from "../interface/IChatInfo";
import IChatEvent from "../interface/IChatEvent";
import IChatMessage from "../interface/IChatMessage";
import EventEmitter from "events";
import { sleep } from "../utils/Utils";

/* ==== PROPERTIES ============================================================================== */
const logger: ClassLogger = new ClassLogger(null as any, __filename);

// Taken from the website http requests sent from the website, seem to be consistent
// I'm not so sure whether the complete channel and the chatId are bound to the account
// Just in case, I'm retrieving them from the .env so that I don't have to share them
const LOGIN_COOKIE: string = process.env.POE_LOGIN_COOKIE as string;
const COMPLETE_CHANNEL: string = process.env.POE_COMPLETE_CHANNEL as string;

// This is returned from the events, but you don't have it in advance
// I don't know how to get it yet (except hardcode the one I saw in the http requests)
const CHAT_ID: number = Number.parseInt(process.env.POE_CHAT_ID as string);

// Max waiting time until giving up on the chatbot response (milliseconds)
const LONG_POLLING_TIMEOUT: number = 20000;

// "global" variables retrieved at the startup from retrieveChatInfo()
let formKey: string;
let seq: string;
let channel: string;
let channelHash: string;

// Used to retrieve the expected reply after a message is sent
const chatMessageEmitter: EventEmitter = new EventEmitter();

/* ==== METHODS ================================================================================= */
/** Retrieve and set "global" variables used by the other methods
    After retrieving all the useful data, start the chat connection */
export function retrieveChatInfo(): void {
    const url = `https://poe.com/api/settings?channel=${COMPLETE_CHANNEL}`;
    axios.get(url, { headers: { cookie: LOGIN_COOKIE } })
    .then(r => r.data)
    .then((data: IChatInfo): void => {
        formKey = data.formkey;
        seq = data.tchannelData.minSeq,
        channel = data.tchannelData.boxName;
        channelHash = data.tchannelData.channelHash
        //logger.debug(`Retrieved chat info: formKey=${formKey}, seq=${seq}, channel=${channel}, channelHash=${channelHash}`);
    })
    .then((): void => initChatConnection());
}

/** Open a WSS connection and start listening for events
    Incoming events will contains our own messages, ChatGPT replies, suggestions and chat metadata
    We only care about ChatGPT complete replies (we'll also receive partial messages) */
function initChatConnection(): void {

    // Open WSS connection
    const socket = new WebSocket(`wss://tch189261.tch.poe.com/up/${channel}/updates?min_seq=${seq}&channel=${COMPLETE_CHANNEL}&hash=${channelHash}`);
    socket.addEventListener("open", _ => logger.info("ChatGPT WSS connection succesfully established"));

    // Add event listener on incoming messages
    socket.addEventListener("message", event  => {
        const chatEvent: IChatEvent = JSON.parse(event.data as string);

        // Assert that messages are actually in the event - should always be true
        if(!chatEvent.messages || chatEvent.messages.length === 0) return logger.warn("Event missing messages property");

        // Retrieve the last message from the array (the array contains the full message creation history)
        const chatGptMessage: IChatMessage = JSON.parse(chatEvent.messages.pop() as string);
    
        // After reply and suggestions, another event is sent, it doesn't contain any useful information
        // It contains informations about the messages available on the current subscription
        if(!chatGptMessage.payload.data.messageAdded) return;
    
        // To avoid incomplete messages, check the message state
        if(chatGptMessage.payload.data.messageAdded.state !== "complete") return;

        // To avoid our own messages, check the message author
        if(chatGptMessage.payload.data.messageAdded.author === "human") return;

        // To avoid events where only suggested replies are sent, check the suggestedReplies array
        if(chatGptMessage.payload.data.messageAdded.suggestedReplies.length !== 0) return;
    
        // Gather all the data we care about
        const rawMessage: string = chatGptMessage.payload.data.messageAdded.text;
        const embedMessage: string = chatGptMessage.payload.data.messageAdded.linkifiedText;
        // chatId = chatId || chatGptMessage.payload.data.messageAdded.chat.chatId;

        logger.debug(`Reply received: ${rawMessage}`);

        // Send message event so that other methods can wait and retrieve it
        chatMessageEmitter.emit("message", rawMessage, embedMessage);
    })
}

async function sendMessage(text: string): Promise<void> {

    // Define the headers for the request
    const headers = {
        headers: {
            cookie: LOGIN_COOKIE,
            "poe-formkey": formKey,
            "Content-Type": "application/json"
        }
    }

    // Define the POST body for the request (a GraphQL Query)
    const body: object = {
        "queryName": "chatHelpers_sendMessageMutation_Mutation",
        "variables": {
            "chatId": CHAT_ID,
            "bot": "chinchilla",
            "query": text,
            "source": null,
            "withChatBreak": false
        },
        "query": "mutation chatHelpers_sendMessageMutation_Mutation(\n  $chatId: BigInt!\n  $bot: String!\n  $query: String!\n  $source: MessageSource\n  $withChatBreak: Boolean!\n) {\n  messageEdgeCreate(chatId: $chatId, bot: $bot, query: $query, source: $source, withChatBreak: $withChatBreak) {\n    chatBreak {\n      cursor\n      node {\n        id\n        messageId\n        text\n        author\n        suggestedReplies\n        creationTime\n        state\n      }\n      id\n    }\n    message {\n      cursor\n      node {\n        id\n        messageId\n        text\n        author\n        suggestedReplies\n        creationTime\n        state\n        chat {\n          shouldShowDisclaimer\n          id\n        }\n      }\n      id\n    }\n  }\n}\n"
    };

    logger.debug(`Send POST request with headers ${headers} and body ${body}`);

    // Make the actual request
    return await axios.post("https://poe.com/api/gql_POST", body, headers);
}

/** Send a new message to the chat and wait for it to respond listening to a custom event
    Once the TIMEOUT is reached, the polling will close and the Promise will be rejected */
export async function sendMessageAndPoll(text: string): Promise<string[]> {

    // Send the actual message
    await sendMessage(text);

    // Return Promise that waits for the reply
    return new Promise(async (resolve, reject) => {

        // Listen for chat message event
        chatMessageEmitter.on("message", (rawMessage: string, embedMessage: string) => resolve([rawMessage, embedMessage]));

        // Reject after the TIMEOUT is reached
        await sleep(LONG_POLLING_TIMEOUT);
        reject(`Response timeout after ${LONG_POLLING_TIMEOUT}ms`);
    });
}
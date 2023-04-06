var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("logging/Logger", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClassLogger = exports.Logger = void 0;
    var RESET_COLOR = "\x1b[0m";
    var LOG_LEVEL_DEBUG = 0;
    var LOG_LEVEL_INFO = 1;
    var LOG_LEVEL_WARN = 2;
    var LOG_LEVEL_ERROR = 3;
    var logLevel = getLogLevel();
    function getLogLevel() {
        if (process.env.LOG_LEVEL == "DEBUG")
            return LOG_LEVEL_DEBUG;
        if (process.env.LOG_LEVEL == "WARN")
            return LOG_LEVEL_WARN;
        if (process.env.LOG_LEVEL == "ERROR")
            return LOG_LEVEL_ERROR;
        return LOG_LEVEL_INFO;
    }
    var Logger = exports.Logger = (function () {
        function Logger() {
        }
        Logger.debug = function (text) { if (logLevel <= LOG_LEVEL_DEBUG)
            Logger.print("DEBUG", "\x1b[35m", text); };
        Logger.info = function (text) { if (logLevel <= LOG_LEVEL_INFO)
            Logger.print("INFO", "\x1b[36m", text); };
        Logger.warn = function (text) { if (logLevel <= LOG_LEVEL_WARN)
            Logger.print("WARN", "\x1b[33m", text); };
        Logger.error = function (text) { return Logger.print("ERROR", "\x1b[31m", text); };
        Logger.print = function (level, color, text) {
            return console.log("[".concat(color).concat(level).concat(RESET_COLOR, "] \u001B[1m\u001B[90m").concat(new Date().toLocaleTimeString("en-GB")).concat(RESET_COLOR, " ").concat(text));
        };
        return Logger;
    }());
    var ClassLogger = (function () {
        function ClassLogger(className, dirname) {
            var _this = this;
            this.a = function () { return "[\u001B[1m".concat(_this.className).concat(RESET_COLOR, "] "); };
            this.debug = function (text) { return Logger.debug(_this.a() + text); };
            this.info = function (text) { return Logger.info(_this.a() + text); };
            this.warn = function (text) { return Logger.warn(_this.a() + text); };
            this.error = function (text) { return Logger.error(_this.a() + text); };
            this.className = dirname
                ? (dirname.split("/ts-leotta-talkative/", 2)[1].replace(/\//g, '.').replace(/\.[tj]?s/, '') + (className ? ('.' + className) : ""))
                : className;
        }
        return ClassLogger;
    }());
    exports.ClassLogger = ClassLogger;
});
define("event/ReadyEvent", ["require", "exports", "discord.js", ".."], function (require, exports, discord_js_1, __1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = (function () {
        var _a;
        (_a = __1.tsLeottaTalkative.user) === null || _a === void 0 ? void 0 : _a.setPresence({ activities: [{ name: "your voice", type: discord_js_1.ActivityType.Listening }], status: 'idle' });
        __1.tsLeottaTalkative.logger.info("========= Bot deployed on version ".concat(process.env.VERSION, " ========="));
    });
});
define("interface/ICommand", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("interface/IMessageCommandMap", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ;
});
define("utils/Utils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sleep = exports.applyAlias = void 0;
    function applyAlias(obj) {
        for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
            var key = _a[_i];
            var subkeys = key.split(/,\s?/);
            if (subkeys.length == 1)
                continue;
            var target = obj[key];
            delete obj[key];
            for (var _b = 0, subkeys_1 = subkeys; _b < subkeys_1.length; _b++) {
                var subkey = subkeys_1[_b];
                obj[subkey] = target;
            }
        }
    }
    exports.applyAlias = applyAlias;
    function sleep(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }
    exports.sleep = sleep;
});
define("command/message/PingCommand", ["require", "exports", "../.."], function (require, exports, __2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.pingCommand = void 0;
    exports.pingCommand = {
        name: "ping",
        fn: function (msg) { return msg.reply("Pxng! (".concat(__2.tsLeottaTalkative.ws.ping, "ms)")); }
    };
});
define("fragment/GoogleSynthetizer", ["require", "exports", "axios", "logging/Logger"], function (require, exports, axios_1, Logger_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CombinedStream = require('combined-stream');
    var synthetize = function (text, language) { return __awaiter(void 0, void 0, void 0, function () {
        var chunkedText, streams, combinedStream, _i, chunkedText_1, chunk, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    chunkedText = text.match(/.{1,200}/g);
                    streams = [];
                    combinedStream = CombinedStream.create();
                    _i = 0, chunkedText_1 = chunkedText;
                    _c.label = 1;
                case 1:
                    if (!(_i < chunkedText_1.length)) return [3, 4];
                    chunk = chunkedText_1[_i];
                    _b = (_a = combinedStream).append;
                    return [4, synthetizeChunk(chunk, language)];
                case 2:
                    _b.apply(_a, [_c.sent()]);
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3, 1];
                case 4: return [2, combinedStream];
            }
        });
    }); };
    var synthetizeChunk = function (text, language) { return __awaiter(void 0, void 0, void 0, function () {
        var parsedText, audioURL;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    parsedText = encodeURIComponent(text.toLowerCase());
                    Logger_1.Logger.debug("Urlencoded text for google: ".concat(text, " (").concat(parsedText.length, ")"));
                    audioURL = "https://translate.google.com/translate_tts?ie=UTF-8&q=".concat(parsedText, "&tl=").concat(language, "&client=tw-ob&ttsspeed=1");
                    return [4, axios_1.default.get(audioURL, { responseType: 'stream' })];
                case 1: return [2, (_a.sent()).data];
            }
        });
    }); };
    exports.default = synthetize;
});
define("interface/IChatInfo", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("interface/IChatEvent", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("interface/IChatMessage", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("fragment/ChatGpt", ["require", "exports", "ws", "axios", "logging/Logger", "events", "utils/Utils"], function (require, exports, ws_1, axios_2, Logger_2, events_1, Utils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sendMessageAndPoll = exports.retrieveChatInfo = void 0;
    var logger = new Logger_2.ClassLogger(null, __filename);
    var LOGIN_COOKIE = process.env.POE_LOGIN_COOKIE;
    var COMPLETE_CHANNEL = process.env.POE_COMPLETE_CHANNEL;
    var CHAT_ID = Number.parseInt(process.env.POE_CHAT_ID);
    var LONG_POLLING_TIMEOUT = 20000;
    var formKey;
    var seq;
    var channel;
    var channelHash;
    var chatMessageEmitter = new events_1.default();
    function retrieveChatInfo() {
        var url = "https://poe.com/api/settings?channel=".concat(COMPLETE_CHANNEL);
        axios_2.default.get(url, { headers: { cookie: LOGIN_COOKIE } })
            .then(function (r) { return r.data; })
            .then(function (data) {
            formKey = data.formkey;
            seq = data.tchannelData.minSeq,
                channel = data.tchannelData.boxName;
            channelHash = data.tchannelData.channelHash;
        })
            .then(function () { return initChatConnection(); });
    }
    exports.retrieveChatInfo = retrieveChatInfo;
    function initChatConnection() {
        var socket = new ws_1.default("wss://tch189261.tch.poe.com/up/".concat(channel, "/updates?min_seq=").concat(seq, "&channel=").concat(COMPLETE_CHANNEL, "&hash=").concat(channelHash));
        socket.addEventListener("open", function (_) { return logger.info("ChatGPT WSS connection succesfully established"); });
        socket.addEventListener("message", function (event) {
            var chatEvent = JSON.parse(event.data);
            if (!chatEvent.messages || chatEvent.messages.length === 0)
                return logger.warn("Event missing messages property");
            var chatGptMessage = JSON.parse(chatEvent.messages.pop());
            if (!chatGptMessage.payload.data.messageAdded)
                return;
            if (chatGptMessage.payload.data.messageAdded.state !== "complete")
                return;
            if (chatGptMessage.payload.data.messageAdded.author === "human")
                return;
            if (chatGptMessage.payload.data.messageAdded.suggestedReplies.length !== 0)
                return;
            var rawMessage = chatGptMessage.payload.data.messageAdded.text;
            var embedMessage = chatGptMessage.payload.data.messageAdded.linkifiedText;
            logger.debug("Reply received: ".concat(rawMessage));
            chatMessageEmitter.emit("message", rawMessage, embedMessage);
        });
    }
    function sendMessage(text) {
        return __awaiter(this, void 0, void 0, function () {
            var headers, body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        headers = {
                            headers: {
                                cookie: LOGIN_COOKIE,
                                "poe-formkey": formKey,
                                "Content-Type": "application/json"
                            }
                        };
                        body = {
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
                        logger.debug("Send POST request with headers ".concat(headers, " and body ").concat(body));
                        return [4, axios_2.default.post("https://poe.com/api/gql_POST", body, headers)];
                    case 1: return [2, _a.sent()];
                }
            });
        });
    }
    function sendMessageAndPoll(text) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, sendMessage(text)];
                    case 1:
                        _a.sent();
                        return [2, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            chatMessageEmitter.on("message", function (rawMessage, embedMessage) { return resolve([rawMessage, embedMessage]); });
                                            return [4, (0, Utils_1.sleep)(LONG_POLLING_TIMEOUT)];
                                        case 1:
                                            _a.sent();
                                            reject("Response timeout after ".concat(LONG_POLLING_TIMEOUT, "ms"));
                                            return [2];
                                    }
                                });
                            }); })];
                }
            });
        });
    }
    exports.sendMessageAndPoll = sendMessageAndPoll;
});
define("command/message/ListenCommand", ["require", "exports", "discord.js", "@discordjs/voice", "@discordjs/opus", "logging/Logger", "utils/Utils", "fs", "wav", "child_process", "fragment/GoogleSynthetizer", "fragment/ChatGpt"], function (require, exports, discord_js_2, voice_1, opus_1, Logger_3, Utils_2, fs_1, wav_1, child_process_1, GoogleSynthetizer_1, ChatGpt_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.listenCommand = exports.ServerConnections = exports.serverConnectionsMap = void 0;
    var logger = new Logger_3.ClassLogger(null, __filename);
    var MIN_DURATION = 1500;
    var SILENCE_MAX_DURATION = 250;
    exports.serverConnectionsMap = new Map();
    var opusEncoder = new opus_1.OpusEncoder(48000, 2);
    var ServerConnections = (function () {
        function ServerConnections() {
            this.userBindings = new Map();
            this.botAudioPlayer = (0, voice_1.createAudioPlayer)();
            this.botAudioPlayer.on("stateChange", function (_, newState) { return logger.debug("AudioPlayer state changed: " + newState.status); });
            this.botAudioPlayer.on("error", function (err) { return logger.error("AudioPlayer error: " + err.message); });
        }
        ServerConnections.prototype.cleanUser = function (userId, callback) {
            if (callback)
                callback();
            this.userBindings.delete(userId);
            if (this.userBindings.size === 0) {
                if (this.botVoiceConnection)
                    this.botVoiceConnection.destroy();
                this.botVoiceConnection = undefined;
            }
        };
        return ServerConnections;
    }());
    exports.ServerConnections = ServerConnections;
    var isListeningActive = function (userId, guildId) {
        var serverConnections = exports.serverConnectionsMap.get(guildId);
        if (!serverConnections)
            return false;
        if (!serverConnections.userBindings.has(userId))
            return false;
        return true;
    };
    exports.listenCommand = {
        name: "listen",
        fn: function (msg) { return __awaiter(void 0, void 0, void 0, function () {
            var userVoiceChannel, userId, channelId, guildId, serverConnections, botVoiceConnection, alreadyBound, startTimestamp, listening, textChannel, _loop_1, state_1;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!(msg.channel instanceof discord_js_2.TextChannel))
                            return [2];
                        userVoiceChannel = (_a = msg.member) === null || _a === void 0 ? void 0 : _a.voice.channel;
                        if (!userVoiceChannel)
                            return [2, msg.reply("Come cazzo dovrei sentirti??")];
                        userId = (_b = msg.member) === null || _b === void 0 ? void 0 : _b.id;
                        channelId = (_c = msg.member) === null || _c === void 0 ? void 0 : _c.voice.channelId;
                        guildId = msg.guildId;
                        serverConnections = (_d = exports.serverConnectionsMap.get(guildId)) !== null && _d !== void 0 ? _d : new ServerConnections();
                        exports.serverConnectionsMap.set(guildId, serverConnections);
                        botVoiceConnection = (_e = serverConnections.botVoiceConnection) !== null && _e !== void 0 ? _e : (0, voice_1.joinVoiceChannel)({ selfDeaf: false, channelId: channelId, guildId: guildId, adapterCreator: (_f = msg.guild) === null || _f === void 0 ? void 0 : _f.voiceAdapterCreator });
                        serverConnections.botVoiceConnection = botVoiceConnection;
                        alreadyBound = serverConnections.userBindings.has(userId);
                        serverConnections.userBindings.set(userId, msg.channel);
                        if (alreadyBound)
                            return [2];
                        _loop_1 = function () {
                            var userInputStream, wavStream;
                            return __generator(this, function (_h) {
                                switch (_h.label) {
                                    case 0:
                                        startTimestamp = null;
                                        listening = true;
                                        textChannel = serverConnections.userBindings.get(userId);
                                        if (!textChannel)
                                            return [2, { value: serverConnections.cleanUser(userId) }];
                                        if (!userVoiceChannel.members.has(userId))
                                            return [2, { value: serverConnections.cleanUser(userId, function () { return textChannel.send("Scemo ti sto parlando, dove cazzo vai?"); }) }];
                                        userInputStream = botVoiceConnection.receiver.subscribe(userId, { end: { behavior: voice_1.EndBehaviorType.AfterSilence, duration: SILENCE_MAX_DURATION } });
                                        logger.debug("UserInputStream created! Listening...");
                                        textChannel.sendTyping();
                                        wavStream = new wav_1.default.Writer({ sampleRate: 48000, channels: 2, bitDepth: 16 });
                                        userInputStream.on("data", function (data) {
                                            if (!startTimestamp)
                                                startTimestamp = Date.now();
                                            wavStream.push(opusEncoder.decode(data));
                                        });
                                        userInputStream.on("close", function () {
                                            listening = false;
                                            var duration = Date.now() - startTimestamp;
                                            if (duration < MIN_DURATION)
                                                return logger.debug("Trashing recording of ".concat(MIN_DURATION, " ms"));
                                            var outWavPath = "./out/".concat(userId, ".").concat(startTimestamp, ".wav");
                                            var outputStream = fs_1.default.createWriteStream(outWavPath);
                                            wavStream.pipe(outputStream);
                                            outputStream.on("ready", function () {
                                                logger.info("Recording of ".concat(duration, "ms completed and saved to ").concat(outWavPath));
                                                var pyProcess = (0, child_process_1.spawn)("python3", ["./transcribe.py", outWavPath]);
                                                pyProcess.stdout.on("data", function (data) { return __awaiter(void 0, void 0, void 0, function () {
                                                    var result, messageSent, chatResponse, stream, resource;
                                                    var _a, _b, _c;
                                                    return __generator(this, function (_d) {
                                                        switch (_d.label) {
                                                            case 0:
                                                                result = data.toString("utf8");
                                                                if (!result || result.length === 1)
                                                                    return [2, textChannel.send("Non ho capito un cazzo di quello che hai detto, **".concat((_a = msg.member) === null || _a === void 0 ? void 0 : _a.nickname, "**..."))];
                                                                return [4, textChannel.send("**".concat((_b = msg.member) === null || _b === void 0 ? void 0 : _b.nickname, "**: ").concat(result))];
                                                            case 1:
                                                                messageSent = _d.sent();
                                                                fs_1.default.unlink(outWavPath, function () { return logger.info("Recording processed and unlinked"); });
                                                                return [4, (0, ChatGpt_1.sendMessageAndPoll)(result)];
                                                            case 2:
                                                                chatResponse = _d.sent();
                                                                return [4, (0, GoogleSynthetizer_1.default)(chatResponse[0], "en")];
                                                            case 3:
                                                                stream = _d.sent();
                                                                messageSent.reply(chatResponse[0]);
                                                                resource = (0, voice_1.createAudioResource)(stream, { inlineVolume: true, inputType: voice_1.StreamType.Arbitrary });
                                                                serverConnections.botAudioPlayer.play(resource);
                                                                (_c = serverConnections.botVoiceConnection) === null || _c === void 0 ? void 0 : _c.subscribe(serverConnections.botAudioPlayer);
                                                                return [2];
                                                        }
                                                    });
                                                }); });
                                            });
                                        });
                                        _h.label = 1;
                                    case 1:
                                        if (!listening) return [3, 3];
                                        return [4, (0, Utils_2.sleep)(1000)];
                                    case 2:
                                        _h.sent();
                                        return [3, 1];
                                    case 3: return [2];
                                }
                            });
                        };
                        _g.label = 1;
                    case 1: return [5, _loop_1()];
                    case 2:
                        state_1 = _g.sent();
                        if (typeof state_1 === "object")
                            return [2, state_1.value];
                        _g.label = 3;
                    case 3:
                        if (isListeningActive(userId, guildId)) return [3, 1];
                        _g.label = 4;
                    case 4: return [2];
                }
            });
        }); }
    };
});
define("command/message/UnlistenCommand", ["require", "exports", "discord.js", "logging/Logger", "command/message/ListenCommand"], function (require, exports, discord_js_3, Logger_4, ListenCommand_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.unlistenCommand = void 0;
    var logger = new Logger_4.ClassLogger(null, __filename);
    exports.unlistenCommand = {
        name: "listen",
        fn: function (msg) { return __awaiter(void 0, void 0, void 0, function () {
            var userId, guildId, serverConnections;
            var _a;
            return __generator(this, function (_b) {
                if (!(msg.channel instanceof discord_js_3.TextChannel))
                    return [2];
                userId = (_a = msg.member) === null || _a === void 0 ? void 0 : _a.id;
                guildId = msg.guildId;
                serverConnections = ListenCommand_1.serverConnectionsMap.get(guildId);
                if (!serverConnections)
                    return [2];
                if (!serverConnections.userBindings.has(userId))
                    return [2];
                return [2, serverConnections.cleanUser(userId)];
            });
        }); }
    };
});
define("event/MessageCreateEvent", ["require", "exports", "logging/Logger", "utils/Utils", "command/message/PingCommand", "command/message/ListenCommand", "command/message/UnlistenCommand"], function (require, exports, Logger_5, Utils_3, PingCommand_1, ListenCommand_2, UnlistenCommand_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var logger = new Logger_5.ClassLogger(null, __filename);
    exports.default = (function (_, msg) { return __awaiter(void 0, void 0, void 0, function () {
        var prefix, args, cmdName, cmd, e_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    prefix = process.env.PREFIX;
                    if (msg.author.bot)
                        return [2];
                    if (!msg.content.startsWith(prefix))
                        return [2];
                    msg.content = msg.content.substring(prefix.length + (msg.content.charAt(prefix.length) == " " ? 1 : 0));
                    args = msg.content.split(/[\n ]+/);
                    if (!args[0])
                        return [2, msg.reply("Cazzo vuoi?")];
                    cmdName = args.shift().toLowerCase();
                    logger.debug("".concat((_a = msg.guild) === null || _a === void 0 ? void 0 : _a.name, " - ").concat(msg.author.username, ": ").concat(msg.content));
                    cmd = messageCommandMap[cmdName];
                    if (!cmd)
                        return [2];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4, cmd.fn.apply(cmd, __spreadArray([msg], args, false))];
                case 2:
                    _b.sent();
                    return [3, 4];
                case 3:
                    e_1 = _b.sent();
                    logger.error("Error during the execution of ".concat(cmdName, ": ").concat(e_1.message));
                    console.error(e_1);
                    return [3, 4];
                case 4: return [2];
            }
        });
    }); });
    var messageCommandMap = {
        "pang, peng, ping, pong, pung": PingCommand_1.pingCommand,
        "listen": ListenCommand_2.listenCommand,
        "stop, cagati": UnlistenCommand_1.unlistenCommand
    };
    (0, Utils_3.applyAlias)(messageCommandMap);
});
define("event/VoiceStateEvent", ["require", "exports", "@discordjs/opus", "..", "logging/Logger"], function (require, exports, opus_2, __3, Logger_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var opusEncoder = new opus_2.OpusEncoder(48000, 2);
    var logger = new Logger_6.ClassLogger(null, __filename);
    exports.default = (function (_, oldState, newState) {
        var _a;
        if (oldState.id === ((_a = __3.tsLeottaTalkative.user) === null || _a === void 0 ? void 0 : _a.id))
            return;
    });
});
define("config/TsLeottaTalkative", ["require", "exports", "discord.js", "logging/Logger", "event/ReadyEvent", "event/MessageCreateEvent", "event/VoiceStateEvent"], function (require, exports, discord_js_4, Logger_7, ReadyEvent_1, MessageCreateEvent_1, VoiceStateEvent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TsLeottaTalkative = (function (_super) {
        __extends(TsLeottaTalkative, _super);
        function TsLeottaTalkative(options) {
            var _this = _super.call(this, options) || this;
            _this.init = function () {
                var isProd = process.env.ENV == "P" ? true : false;
                _this.logger.info("======= Deploy started on enviroment ".concat(isProd ? "PROD" : "TEST", " ======="));
                _this.login(isProd ? process.env.PROD_KEY : process.env.TEST_KEY);
                _this.once("ready", ReadyEvent_1.default.bind(null, _this));
                _this.logger.info("Listening on event 'ready'");
                _this.on("messageCreate", MessageCreateEvent_1.default.bind(null, _this));
                _this.logger.info("Listening on event 'messageCreate'");
                _this.on("voiceStateUpdate", VoiceStateEvent_1.default.bind(null, _this));
                _this.logger.info("Listening on event 'voiceStateUpdate'");
            };
            _this.logger = new Logger_7.ClassLogger(null, __filename);
            return _this;
        }
        return TsLeottaTalkative;
    }(discord_js_4.Client));
    exports.default = TsLeottaTalkative;
});
define("index", ["require", "exports", "dotenv", "discord.js", "fs", "config/TsLeottaTalkative", "fragment/ChatGpt"], function (require, exports, dotenv_1, discord_js_5, fs_2, TsLeottaTalkative_1, ChatGpt_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.tsLeottaTalkative = void 0;
    dotenv_1.default.config();
    exports.tsLeottaTalkative = new TsLeottaTalkative_1.default({
        intents: [
            discord_js_5.GatewayIntentBits.DirectMessages,
            discord_js_5.GatewayIntentBits.DirectMessageReactions,
            discord_js_5.GatewayIntentBits.DirectMessageTyping,
            discord_js_5.GatewayIntentBits.Guilds,
            discord_js_5.GatewayIntentBits.GuildEmojisAndStickers,
            discord_js_5.GatewayIntentBits.GuildIntegrations,
            discord_js_5.GatewayIntentBits.GuildInvites,
            discord_js_5.GatewayIntentBits.GuildMessages,
            discord_js_5.GatewayIntentBits.GuildMessageReactions,
            discord_js_5.GatewayIntentBits.GuildMessageTyping,
            discord_js_5.GatewayIntentBits.GuildVoiceStates,
            discord_js_5.GatewayIntentBits.GuildWebhooks,
            discord_js_5.GatewayIntentBits.MessageContent
        ],
        makeCache: discord_js_5.Options.cacheWithLimits({
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
    exports.tsLeottaTalkative.init();
    var outputDir = "./out/";
    fs_2.default.readdir(outputDir, function (err, files) {
        var _loop_2 = function (file) {
            var filePath = outputDir + file;
            fs_2.default.unlink(filePath, function () { return exports.tsLeottaTalkative.logger.debug("".concat(filePath, " deleted")); });
        };
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            _loop_2(file);
        }
    });
    (0, ChatGpt_2.retrieveChatInfo)();
});

/* ==== CONST ======================================================================= */
const RESET_COLOR = "\x1b[0m";

const LOG_LEVEL_DEBUG = 0;
const LOG_LEVEL_INFO = 1;
const LOG_LEVEL_WARN = 2;
const LOG_LEVEL_ERROR = 3;

const logLevel = getLogLevel();

function getLogLevel() {
    if(process.env.LOG_LEVEL == "DEBUG") return LOG_LEVEL_DEBUG;
    if(process.env.LOG_LEVEL == "WARN") return LOG_LEVEL_WARN;
    if(process.env.LOG_LEVEL == "ERROR") return LOG_LEVEL_ERROR;
    return LOG_LEVEL_INFO;
}

/* ==== EXPORTS ===================================================================== */
export class Logger {
    public static debug = (text: string): void => { if(logLevel <= LOG_LEVEL_DEBUG) Logger.print("DEBUG", "\x1b[35m", text) };
    public static info = (text: string): void => { if(logLevel <= LOG_LEVEL_INFO) Logger.print("INFO", "\x1b[36m", text) };
    public static warn = (text: string): void => { if(logLevel <= LOG_LEVEL_WARN) Logger.print("WARN", "\x1b[33m", text) };
    public static error = (text: string): void => Logger.print("ERROR", "\x1b[31m", text);
    
    private static print = (level: string, color: string, text: string): void =>
        console.log(`[${color}${level}${RESET_COLOR}] \x1b[1m\x1b[90m${new Date().toLocaleTimeString("en-GB")}${RESET_COLOR} ${text}`);
}

export class ClassLogger {
    private className: string;
    constructor(className: string, dirname?: string) {
        this.className = dirname
        ? (dirname.split("/ts-leotta-talkative/", 2)[1].replace(/\//g, '.').replace(/\.[tj]?s/, '') + ( className ? ('.'+className) : "" ))
        : className;
    }

    private a = (): string => `[\x1b[1m${this.className}${RESET_COLOR}] `;
    public debug =  (text: string): void => Logger.debug(this.a() + text);
    public info =   (text: string): void => Logger.info(this.a() + text);
    public warn =   (text: string): void => Logger.warn(this.a() + text);
    public error =  (text: string): void => Logger.error(this.a() + text);
}

/* ==== CARATTERI UTILIZZATI ==================================================================== *
Bright: "\x1b[1m",
Dim: "\x1b[2m",
Underscore: "\x1b[4m",
Blink: "\x1b[5m",
Reverse: "\x1b[7m",
Hidden: "\x1b[8m",
Reset: "\x1b[0m",       // Reset coloured text

FgRed: "\x1b[31m",
FgGreen: "\x1b[32m",
FgYellow: "\x1b[33m",
FgCyan: "\x1b[36m",
FgWhite: "\x1b[37m",

/* ==== UTILIZZO GENERICO ======================================================================= *
!   \x1b[{numero}m

FG  BG

30	40	Black
31	41	Red
32	42	Green
33	43	Yellow
34	44	Blue
35	45	Magenta
36	46	Cyan
37	47	White
90	100	Bright Black (Gray)
91	101	Bright Red
92	102	Bright Green
93	103	Bright Yellow
94	104	Bright Blue
95	105	Bright Magenta
96	106	Bright Cyan
97	107	Bright White

*/
import chalk from "jsr:@nothing628/chalk";

const _log = console.log;

export enum LogType {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    DEBUG = "debug"
}

export function log(message: string, type: LogType = LogType.INFO) {
    switch (type) {
        case LogType.INFO:
            _log(chalk.blue(message));
            break;
        case LogType.WARNING:
            _log(chalk.yellow(message));
            break;
        case LogType.ERROR:
            _log(chalk.red(message));
            break;
        case LogType.DEBUG:
            _log(chalk.grey(message));
            break;
        default:
            _log(message);
    }
}

export const debug = Deno.env.get("DEBUG") === "true" || false;
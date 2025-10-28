import { Logger as PinoInstance, LoggerOptions } from 'pino';
import { Logger, LoggerContext } from '@application/ports/Logger';
export declare class PinoLogger implements Logger {
    private readonly logger;
    constructor(options?: LoggerOptions, instance?: PinoInstance);
    info(message: string, obj?: object): void;
    error(message: string, obj?: object): void;
    warn(message: string, obj?: object): void;
    debug(message: string, obj?: object): void;
    child(context: LoggerContext): Logger;
}

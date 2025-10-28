import pino from 'pino';
const resolveBooleanFlag = (value, defaultValue) => {
    if (value === undefined || value === null) {
        return defaultValue;
    }
    const normalized = value.trim().toLowerCase();
    if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) {
        return true;
    }
    if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) {
        return false;
    }
    return defaultValue;
};
const shouldUsePrettyTransport = () => {
    const defaultValue = process.env.NODE_ENV === undefined
        ? true
        : process.env.NODE_ENV === 'development';
    return resolveBooleanFlag(process.env.LOG_PRETTY, defaultValue);
};
const buildTransport = () => {
    if (!shouldUsePrettyTransport()) {
        return undefined;
    }
    return {
        target: 'pino-pretty',
        options: {
            colorize: resolveBooleanFlag(process.env.LOG_COLOR, true),
            translateTime: 'HH:MM:ss',
            singleLine: false,
            ignore: 'pid,hostname',
        },
    };
};
export class PinoLogger {
    logger;
    constructor(options = {}, instance) {
        if (instance) {
            this.logger = instance;
            return;
        }
        const mergedOptions = {
            level: process.env.LOG_LEVEL ?? 'info',
            ...options,
        };
        if (!mergedOptions.transport) {
            const transport = buildTransport();
            if (transport) {
                mergedOptions.transport = transport;
            }
        }
        this.logger = pino(mergedOptions);
    }
    info(message, obj) {
        this.logger.info(obj ?? {}, message);
    }
    error(message, obj) {
        this.logger.error(obj ?? {}, message);
    }
    warn(message, obj) {
        this.logger.warn(obj ?? {}, message);
    }
    debug(message, obj) {
        this.logger.debug(obj ?? {}, message);
    }
    child(context) {
        const childInstance = this.logger.child(context);
        return new PinoLogger({}, childInstance);
    }
}
//# sourceMappingURL=PinoLogger.js.map
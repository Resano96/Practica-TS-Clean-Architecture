
import pino, { Logger as PinoInstance, LoggerOptions } from 'pino';
import { Logger, LoggerContext } from '@application/ports/Logger';

const resolveBooleanFlag = (value: string | undefined, defaultValue: boolean): boolean => {
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

const shouldUsePrettyTransport = (): boolean => {
  const defaultValue =
    process.env.NODE_ENV === undefined
      ? true
      : process.env.NODE_ENV === 'development';
  return resolveBooleanFlag(process.env.LOG_PRETTY, defaultValue);
};

const buildTransport = (): LoggerOptions['transport'] | undefined => {
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

export class PinoLogger implements Logger {
  private readonly logger: PinoInstance;

  constructor(options: LoggerOptions = {}, instance?: PinoInstance) {
    if (instance) {
      this.logger = instance;
      return;
    }

    const mergedOptions: LoggerOptions = {
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

  info(message: string, obj?: object): void {
    this.logger.info(obj ?? {}, message);
  }

  error(message: string, obj?: object): void {
    this.logger.error(obj ?? {}, message);
  }

  warn(message: string, obj?: object): void {
    this.logger.warn(obj ?? {}, message);
  }

  debug(message: string, obj?: object): void {
    this.logger.debug(obj ?? {}, message);
  }

  child(context: LoggerContext): Logger {
    const childInstance = this.logger.child(context);
    return new PinoLogger({}, childInstance);
  }
}

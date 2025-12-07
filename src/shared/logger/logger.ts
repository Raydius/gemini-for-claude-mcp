import pino from 'pino';
import type { Logger as PinoLogger } from 'pino';

export interface ILogger {
  readonly info: (message: string, context?: Record<string, unknown>) => void;
  readonly error: (message: string, context?: Record<string, unknown>) => void;
  readonly warn: (message: string, context?: Record<string, unknown>) => void;
  readonly debug: (message: string, context?: Record<string, unknown>) => void;
}

export function createLogger(level: string): ILogger {
  const pinoLogger: PinoLogger = pino(
    process.env['NODE_ENV'] !== 'production'
      ? {
          level,
          transport: {
            target: 'pino-pretty',
            options: { colorize: true },
          },
        }
      : { level },
  );

  return {
    info: (message, context): void => {
      pinoLogger.info(context ?? {}, message);
    },
    error: (message, context): void => {
      pinoLogger.error(context ?? {}, message);
    },
    warn: (message, context): void => {
      pinoLogger.warn(context ?? {}, message);
    },
    debug: (message, context): void => {
      pinoLogger.debug(context ?? {}, message);
    },
  };
}

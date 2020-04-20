import * as winston from 'winston';
import { Config } from '../../config/config';

export class LoggerFactory {

  private static logger: winston.Logger;

  public static get() {
    if (!this.logger) {
      const myCustomLevels = {
        levels: {
          debug: 3,
          info: 2,
          warn: 1,
          error: 0
        },
        colors: {
          warn: 'yellow',
          debug: 'green',
          info: 'blue',
          error: 'red'
        }
      };

      this.logger = winston.createLogger({
        levels: myCustomLevels.levels,
        transports: [this.getConsoleTransport()],
      });
      winston.addColors(myCustomLevels.colors);
    }
    return this.logger;
  }

  private static getConsoleTransport() {
    const logLevel = Config.get().LOG_LEVEL;

    return new winston.transports.Console({
      level: logLevel,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf((info) => {
          const {
            timestamp, level, message, ...args
          } = info;

          return `${timestamp} - ${level} - ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
        }),
      )
    });
  }
}

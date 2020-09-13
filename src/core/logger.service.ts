import { Logger, Optional } from '@nestjs/common';
import * as winston from 'winston';
import { CommonHelper } from './utils/CommonHelper';
import 'winston-daily-rotate-file';
import * as fs from 'fs';

export class AdvancedLogger extends Logger {
    private readonly logger: winston.Logger;

    constructor(@Optional() protected context?: string, @Optional() isTimestampEnabled = false) {
        super(context, isTimestampEnabled);

        if (!fs.existsSync('logs')) {
            fs.mkdirSync('logs');
        }

        this.logger = winston.createLogger({
            level: CommonHelper.isDebugMode() ? 'debug' : 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf((log) => `${log.timestamp}\t${log.level.toUpperCase()}\t${context}\t${log.stack ? log.stack : log.message}`),
            ),
            //defaultMeta: { service: 'user-service' },
            //TODO: @michaelsogos -> Add to defaultMeta name of module or at least name of app\microservice
            transports: [
                new winston.transports.DailyRotateFile({
                    filename: `logs/%DATE%.log`,
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                }),
            ],
            exitOnError: false,
        });

        this.logger.exceptions.handle();
    }

    error(message: string, trace: string) {
        super.error(message, trace);
        this.logger.error(trace);
    }

    log(message: string) {
        this.debug(message);
    }

    warn(message: string) {
        super.warn(message);
        this.logger.warn(message);
    }

    debug(message: string) {
        super.debug(message);
        this.logger.debug(message);
    }
    verbose(message: string) {
        this.debug(message);
    }

    info(message: string) {
        super.log(message);
        this.logger.info(message);
    }
}

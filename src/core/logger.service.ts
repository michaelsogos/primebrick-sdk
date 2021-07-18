import { ConsoleLogger, Optional } from '@nestjs/common';
import * as winston from 'winston';
import { CommonHelper } from './utils/CommonHelper';
import 'winston-daily-rotate-file';
import * as fs from 'fs';

export class AdvancedLogger extends ConsoleLogger {
    private readonly logger: winston.Logger;
    // private readonly timestampEnabled: boolean;

    constructor(@Optional() protected context?: string, @Optional() isTimestampEnabled = false) {
        super(context, { timestamp: isTimestampEnabled });
        // this.timestampEnabled = isTimestampEnabled;

        if (!fs.existsSync('logs')) {
            fs.mkdirSync('logs');
        }

        //TODO: @mso -> Winston seems to not be fully async this mean it will impact code execution
        // We can give a try to PINO, many posts confirm that is fully async and resolve memory leak and cpu spikes
        // In other project i made however winston didn't gave me any problem, even if still remain not async
        this.logger = winston.createLogger({
            level: CommonHelper.isDebugMode() ? 'debug' : 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(
                    (log) => `${log.timestamp}\t${log.level.toUpperCase()}\t${this.context}\t${log.stack ? log.stack : log.message}`,
                ),
            ),
            //defaultMeta: { service: 'user-service' },
            //TODO: @michaelsogos -> Add to defaultMeta name of module or at least name of app\microservice
            transports: [
                new winston.transports.DailyRotateFile({
                    filename: `logs/%DATE%.log`,
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxFiles: 15,
                }),
            ],
            exitOnError: false,
        });

        this.logger.exceptions.handle();
    }

    error(message: string | Error, trace?: string) {
        const errorMessage = message instanceof Error ? message.message : message;
        const errorTrace = message instanceof Error ? message.stack : trace;
        const isException = message instanceof Error ? true : false;

        super.error(isException ? errorTrace : errorMessage, isException ? '' : errorTrace, this.context);
        // Logger.error(isException ? errorTrace : errorMessage, isException ? '' : errorTrace, this.context, this.timestampEnabled);
        this.logger.error(errorTrace || errorMessage);
    }

    log(message: string) {
        super.log(message, this.context);
        // Logger.log(message, this.context, this.timestampEnabled);
        this.logger.info(message);
    }

    warn(message: string) {
        super.warn(message, this.context);
        // Logger.warn(message, this.context, this.timestampEnabled);
        this.logger.warn(message);
    }

    debug(message: string) {
        super.debug(message, this.context);
        // Logger.debug(message, this.context, this.timestampEnabled);
        this.logger.debug(message);
    }
    verbose(message: string) {
        super.verbose(message, this.context);
        // Logger.verbose(message, this.context, this.timestampEnabled);
        this.logger.debug(message);
    }

    info(message: string) {
        super.log(message, this.context);
        // Logger.log(message, this.context, this.timestampEnabled);
        this.logger.info(message);
    }

    setContext(context: string) {
        super.context = context;
        this.context = context;
    }
}

import { ConsoleLogger, Injectable, LoggerService, Optional } from '@nestjs/common';
import * as winston from 'winston';
import { CommonHelper } from '../../core/utils/CommonHelper';
import 'winston-daily-rotate-file';
import * as fs from 'fs';

@Injectable()
export class LogManagerService extends ConsoleLogger implements LoggerService {
    private readonly logger: winston.Logger;

    constructor() {
        super(process.brickName, { timestamp: true });

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
        this.logger.error(errorTrace || errorMessage);
    }

    log(message: string) {
        super.log(message, this.context);
        this.logger.info(message);
    }

    warn(message: string) {
        super.warn(message, this.context);
        this.logger.warn(message);
    }

    debug(message: string) {
        super.debug(message, this.context);
        this.logger.debug(message);
    }
    verbose(message: string) {
        super.verbose(message, this.context);
        this.logger.debug(message);
    }

    info(message: string) {
        super.log(message, this.context);
        this.logger.info(message);
    }

    setContext(context: string) {
        super.context = context;
        this.context = context;
    }
}

import { Module } from '@nestjs/common';
import { LogManagerService } from './logmanager.service';

@Module({
    providers: [LogManagerService],
    exports: [LogManagerService],
})
export class LogManagerModule {}

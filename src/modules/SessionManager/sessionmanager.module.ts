import { Module } from '@nestjs/common';
import { SessionManagerService } from './sessionmanager.service';

@Module({
    providers: [SessionManagerService],
    exports: [SessionManagerService],
})
export class SessionManagerModule {}

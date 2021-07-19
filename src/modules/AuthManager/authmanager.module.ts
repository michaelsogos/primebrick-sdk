import { Module } from '@nestjs/common';
import { AdvancedLogger } from '../../core/logger.service';
import { LocalAuthManagerService } from './localauthmanager.service';

@Module({
    imports: [],
    controllers: [],
    providers: [AdvancedLogger, LocalAuthManagerService],
    exports: [LocalAuthManagerService],
})
export class AuthManagerModule {}

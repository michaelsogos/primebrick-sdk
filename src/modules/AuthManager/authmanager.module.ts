import { Module } from '@nestjs/common';
import { LogManagerModule } from '../LogManager/logmanager.module';
import { LocalAuthManagerService } from './localauthmanager.service';

@Module({
    imports: [LogManagerModule],
    controllers: [],
    providers: [LocalAuthManagerService],
    exports: [LocalAuthManagerService],
})
export class AuthManagerModule {}

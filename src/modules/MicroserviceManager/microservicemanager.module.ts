import { Module } from '@nestjs/common';
import { AdvancedLogger } from '../../core/logger.service';
import { ProcessorManagerModule } from '../ProcessorManager/processormanager.module';
import { MicroserviceManagerController } from './microservicemanager.controller';
import { MicroserviceManagerService } from './microservicemanager.service';

@Module({
    imports: [ProcessorManagerModule],
    controllers: [MicroserviceManagerController],
    providers: [MicroserviceManagerService, AdvancedLogger],
    exports: [],
})
export class MicroserviceManagerModule {}

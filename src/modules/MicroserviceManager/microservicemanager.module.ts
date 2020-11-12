import { Module } from '@nestjs/common';
import { ProcessorManagerModule } from '../ProcessorManager/processormanager.module';
import { MicroserviceManagerController } from './microservicemanager.controller';
import { MicroserviceManagerService } from './microservicemanager.service';

@Module({
    imports: [ProcessorManagerModule],
    controllers: [MicroserviceManagerController],
    providers: [MicroserviceManagerService],
    exports: [],
})
export class MicroserviceManagerModule {}

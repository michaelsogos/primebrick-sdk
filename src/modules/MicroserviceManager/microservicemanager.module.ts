import { Module } from '@nestjs/common';
import { LogManagerModule } from '../LogManager/logmanager.module';
import { ProcessorManagerModule } from '../ProcessorManager/processormanager.module';
import { TenantManagerModule } from '../TenantManager/tenantmanager.module';
import { DataAccessController } from './dataaccess.controller';
import { DataAccessService } from './dataaccess.service';
import { MicroserviceManagerController } from './microservicemanager.controller';
import { MicroserviceManagerService } from './microservicemanager.service';

@Module({
    imports: [ProcessorManagerModule, TenantManagerModule, LogManagerModule],
    controllers: [MicroserviceManagerController, DataAccessController],
    providers: [MicroserviceManagerService, DataAccessService],
    exports: [MicroserviceManagerService],
})
export class MicroserviceManagerModule {}

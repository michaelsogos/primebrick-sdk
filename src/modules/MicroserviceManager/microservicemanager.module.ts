import { Module } from '@nestjs/common';
import { AdvancedLogger } from '../../core/logger.service';
import { ProcessorManagerModule } from '../ProcessorManager/processormanager.module';
import { TenantManagerModule } from '../TenantManager/tenantmanager.module';
import { DataAccessController } from './dataaccess.controller';
import { DataAccessService } from './dataaccess.service';
import { MicroserviceManagerController } from './microservicemanager.controller';
import { MicroserviceManagerService } from './microservicemanager.service';

@Module({
    imports: [ProcessorManagerModule, TenantManagerModule],
    controllers: [MicroserviceManagerController, DataAccessController],
    providers: [MicroserviceManagerService, AdvancedLogger, DataAccessService],
    exports: [MicroserviceManagerService],
})
export class MicroserviceManagerModule {}

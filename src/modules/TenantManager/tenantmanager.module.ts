import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantAlias } from './entities/TenantAlias.entity';
import { Tenant } from './entities/Tenant.entity';
import { TenantManagerService } from './tenantmanager.service';
import { TenantRepositoryService } from './tenantrepository.service';
import { TenantDBConfig } from './entities/TenantDBConfig.entity';
import { TenantAuthConfig } from './entities/TenantAUTHConfig.entity';
import { TenantThemeConfig } from './entities/TenantThemeConfig.entity';
import { AudibleEntitySubscriber } from '../../db/events/audibleentity.subscriber';
import { SessionManagerModule } from '../SessionManager/sessionmanager.module';
import { ProcessorManagerModule } from '../ProcessorManager/processormanager.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Tenant, TenantAlias, TenantDBConfig, TenantAuthConfig, TenantThemeConfig], 'primebrick_coordinator'),
        SessionManagerModule,
        ProcessorManagerModule,
    ],
    controllers: [],
    providers: [TenantManagerService, TenantRepositoryService, AudibleEntitySubscriber],
    exports: [TenantManagerService, TenantRepositoryService],
})
export class TenantManagerModule {}

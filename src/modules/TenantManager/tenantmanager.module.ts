import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantAlias } from './entities/TenantAlias.entity';
import { TenantConfig } from './entities/TenantConfig.entity';
import { TenantManagerService } from './tenantmanager.service';
import { TenantRepositoryService } from './tenantrepository.service';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [TenantAlias, TenantConfig],
      'primebrick_coordinator',
    ),
  ],
  controllers: [],
  providers: [TenantManagerService, TenantRepositoryService],
  exports: [TenantManagerService, TenantRepositoryService],
})
export class TenantManagerModule {}

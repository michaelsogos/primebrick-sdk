import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TenantAlias } from "./entities/TenantAlias.entity";
import { Tenant } from "./entities/Tenant.entity";
import { TenantManagerService } from "./tenantmanager.service";
import { TenantRepositoryService } from "./tenantrepository.service";
import { TenantDBConfig } from "./entities/TenantDBConfig.entity";
import { TenantAuthConfig } from "./entities/TenantAUTHConfig.entity";
import { TenantThemeConfig } from "./entities/TenantThemeConfig.entity";

@Module({
	imports: [TypeOrmModule.forFeature([Tenant, TenantAlias, TenantDBConfig, TenantAuthConfig, TenantThemeConfig], "primebrick_coordinator")],
	controllers: [],
	providers: [TenantManagerService, TenantRepositoryService],
	exports: [TenantManagerService, TenantRepositoryService],
})
export class TenantManagerModule {}

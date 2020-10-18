import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Tenant } from '../modules/TenantManager/entities/Tenant.entity';
import { TenantManagerService } from '../modules/TenantManager/tenantmanager.service';

@Injectable()
export class PrimeBrickModule implements OnApplicationBootstrap {
    constructor(readonly tenantManagerService: TenantManagerService) {}

    async onApplicationBootstrap(): Promise<void> {
        await this.tenantManagerService.loadAllTenantsInMemory(true);

        for (const tenant of global['tenants'] as Tenant[]) {
            if (tenant.tenant_db_config.enable_auto_migration) {
                const migrationsLog = await this.tenantManagerService.updateTenantDatabaseSchema(tenant);
                //TODO: @michaelsogos -> Log migrations status

                if (tenant.tenant_db_config.enable_auto_seed) {
                    const importsLog = await this.tenantManagerService.importTenantDatabaseData(tenant);
                    //TODO: @michaelsogos -> Log imports status
                }
            }
        }
    }
}

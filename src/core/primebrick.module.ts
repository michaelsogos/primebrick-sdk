import { OnApplicationBootstrap } from '@nestjs/common';
import { Tenant } from '../modules/TenantManager/entities/Tenant.entity';
import { TenantManagerService } from '../modules/TenantManager/tenantmanager.service';
import { AdvancedLogger } from './logger.service';

export class PrimeBrickModule implements OnApplicationBootstrap {
    constructor(readonly tenantManagerService: TenantManagerService, readonly logger: AdvancedLogger) {
        logger.setContext(process.env.BRICK_NAME);
    }

    async onApplicationBootstrap(): Promise<void> {
        await this.tenantManagerService.loadAllTenantsInMemory(true);

        for (const tenant of global['tenants'] as Tenant[]) {
            if (tenant.tenant_db_config.enable_auto_migration) {
                const migrationsLog = await this.tenantManagerService.updateTenantDatabaseSchema(tenant);
                for (const migrationLog of migrationsLog)
                    this.logger.info(`Database patch [${migrationLog.name}] applired for database ${tenant.code}`);

                if (tenant.tenant_db_config.enable_auto_seed) {
                    const importsLog = await this.tenantManagerService.importTenantDatabaseData(tenant);
                    for (const importLog of importsLog) {
                        if (importLog.hasError) this.logger.error(`Import of file [${importLog.file}] failed with error: ${importLog.message}]`);
                        else this.logger.info(`Imported ${importLog.count} records from file [${importLog.file}] for entity [${importLog.entity}]`);
                    }
                }
            }
        }
    }
}

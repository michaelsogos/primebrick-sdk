import { Injectable } from '@nestjs/common';
import { Tenant } from './entities/Tenant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Migration, Repository } from 'typeorm';
import { TenantManagerHelper } from './utils/TenantManagerHelper';
import { TenantThemeConfig } from './entities/TenantThemeConfig.entity';
import { TenantRepositoryService } from './tenantrepository.service';
import { CommonHelper } from '../../core/utils/CommonHelper';
import * as fs from 'fs';
import * as path from 'path';
import { SessionManagerContext } from '../SessionManager/sessionmanager.context';
import { SessionContext } from '../../core/models/SessionContext';

@Injectable()
export class TenantManagerService {
    constructor(
        @InjectRepository(Tenant, 'primebrick_coordinator')
        private tenantManagerRepository: Repository<Tenant>,
        @InjectRepository(Tenant, 'primebrick_coordinator')
        private themeManagerRepository: Repository<TenantThemeConfig>,
        private tenantRepositoryService: TenantRepositoryService,
        private readonly sessionManagerContext: SessionManagerContext,
    ) {}

    async getAllTenants(): Promise<Tenant[]> {
        const tenantConfigs = await this.tenantManagerRepository.find({
            relations: ['tenant_aliases', 'tenant_db_config', 'tenant_auth_config'],
        });
        return tenantConfigs;
    }

    async loadAllTenantsInMemory(force: boolean): Promise<void> {
        if (global['tenants'] == null || force) {
            const tenants = await this.getAllTenants();
            global['tenants'] = tenants;
        }
    }

    getTenantConfig(): Tenant {
        let tenantAlias: string = null;
        try {
            const context: SessionContext = this.sessionManagerContext.get('context');
            tenantAlias = context.tenantAlias;
        } catch (ex) {
            throw new Error(
                'TenantManagerService.getTenantConfig() can be used only within an execution context [http request, microservice message, etc.]!',
            );
        }
        return TenantManagerHelper.getTenantConfigByAlias(tenantAlias);
    }

    async getTenantTheme(tenant: Tenant): Promise<TenantThemeConfig> {
        const tenantTheme = await this.themeManagerRepository.findOneOrFail(null, {
            where: { tenant: tenant },
        });

        return tenantTheme;
    }

    async updateTenantDatabaseSchema(tenant?: Tenant): Promise<Migration[]> {
        let connection: Connection = null;
        if (!tenant) connection = await this.tenantRepositoryService.getTenantConnection();
        else connection = await this.tenantRepositoryService.getDbConnectionByTenant(tenant as Tenant);

        return await connection.runMigrations();
    }

    async importTenantDatabaseData(tenant?: Tenant): Promise<any[]> {
        let connection: Connection = null;
        if (!tenant) connection = await this.tenantRepositoryService.getTenantConnection();
        else connection = await this.tenantRepositoryService.getDbConnectionByTenant(tenant as Tenant);

        const modulesPath = path.join(process.cwd(), CommonHelper.isDebugMode() ? 'src' : '', 'modules');
        const importsLog = [];
        const moduleFolders = fs
            .readdirSync(modulesPath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

        for (const folder of moduleFolders) {
            const importFolderPath = path.join(modulesPath, folder, 'resources', 'imports');

            if (fs.existsSync(importFolderPath)) importsLog.push(...(await CommonHelper.importCsv(connection, importFolderPath, 'data-init.json')));
            //TODO: @michaelsogos -> Log imports status
        }

        return importsLog;
    }
}

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
import { ImporterDescriptor } from '../../core/models/ImporterDescriptor';
import { MessagePayload } from '../ProcessorManager/models/MessagePayload';
import { ProcessorManagerService } from '../ProcessorManager/processormanager.service';
import { DataImportLog } from '../../core/models/DataImportLog';
import * as papa from 'papaparse';
import { GlobalRpcAction } from '../../core';
import { DataImport } from '../../core/models/DataImport';

@Injectable()
export class TenantManagerService {
    constructor(
        @InjectRepository(Tenant, 'primebrick_coordinator')
        private tenantManagerRepository: Repository<Tenant>,
        @InjectRepository(Tenant, 'primebrick_coordinator')
        private themeManagerRepository: Repository<TenantThemeConfig>,
        private tenantRepositoryService: TenantRepositoryService,
        private readonly sessionManagerContext: SessionManagerContext,
        private readonly processorManagerService: ProcessorManagerService,
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

    async importTenantDatabaseData(tenant?: Tenant): Promise<DataImportLog[]> {
        const modulesPath = path.join(process.cwd(), CommonHelper.isDebugMode() ? 'src' : 'dist', 'modules');
        const importsLog: DataImportLog[] = [];
        const moduleFolders = fs
            .readdirSync(modulesPath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

        for (const folder of moduleFolders) {
            const importFolderPath = path.join(modulesPath, folder, 'resources', 'imports');

            if (fs.existsSync(importFolderPath)) importsLog.push(...(await this.importCsv(importFolderPath, 'data-init.json', tenant)));
        }

        //TODO: @mso -> Find a way to send back messages as soon as possible instead all together in an array, else system have to wait till all file imported before see what happening
        //An idea could be to use RXJS or OBSERVABLE logic in order to receive a stream of messages
        return importsLog;
    }

    private async importCsv(importFolderPath: string, descriptorFileName: string, tenant?: Tenant): Promise<DataImportLog[]> {
        let connection: Connection = null;
        if (!tenant) connection = await this.tenantRepositoryService.getTenantConnection();
        else connection = await this.tenantRepositoryService.getDbConnectionByTenant(tenant as Tenant);

        //TODO: @mso -> Create a model for return type array
        const descriptorFilePath = path.join(importFolderPath, descriptorFileName);
        if (!fs.existsSync(descriptorFilePath)) return [];

        const literalJson = fs.readFileSync(descriptorFilePath, 'utf8');
        const dataInit: ImporterDescriptor = JSON.parse(literalJson);
        const importLogs: DataImportLog[] = [];

        for (const definition of dataInit.defs) {
            for (const file of definition.files) {
                try {
                    const csvFilePath = path.join(importFolderPath, file);
                    if (!fs.existsSync(csvFilePath))
                        throw new Error(`Import "${definition.name}" failed beacuse csv file "${csvFilePath}" not exists! `);

                    //TODO: @mso - we should avoid to load entire file in memory but instead read file per chunck
                    //see https://itnext.io/using-node-js-to-read-really-really-large-files-pt-1-d2057fe76b33
                    //see https://www.npmjs.com/package/line-reader
                    //see https://attacomsian.com/blog/reading-a-file-line-by-line-in-nodejs
                    //see https://stackabuse.com/reading-a-file-line-by-line-in-node-js/
                    const rawCsv = fs.readFileSync(csvFilePath, definition.csvOptions.encoding);
                    const csv = papa.parse(rawCsv, {
                        skipEmptyLines: true,
                        header: definition.csvOptions.header != undefined ? definition.csvOptions.header : true,
                        quoteChar: definition.csvOptions.quoteChar || '"',
                        delimiter: ImporterDescriptor.mapDelimiterToChar(definition.csvOptions.delimiter),
                    });

                    const isEntityRegistered = CommonHelper.isEntityRegistered(definition.csvOptions.entity);
                    if (isEntityRegistered) importLogs.push(await CommonHelper.importData(connection, csv.data, definition, file));
                    else if (process.brickName == 'core') {
                        throw new Error(
                            `Cannot import data for entity [${definition.csvOptions.entity}] within [core] module because circular referenced entity not registered!`,
                        );
                    } else {
                        let importResult: MessagePayload<DataImportLog> = null;
                        const dataImport = new DataImport();
                        dataImport.data = csv.data;
                        dataImport.definition = definition;
                        dataImport.file = file;

                        if (!tenant)
                            importResult = await this.processorManagerService.sendMessage<DataImport, DataImportLog>(
                                GlobalRpcAction.ROUTE_DATAIMPORT,
                                dataImport,
                            );
                        else
                            importResult = await this.processorManagerService.sendMessageWithTenant<DataImport, DataImportLog>(
                                tenant,
                                GlobalRpcAction.ROUTE_DATAIMPORT,
                                dataImport,
                            );

                        if (importResult.data) importLogs.push(importResult.data);
                    }
                } catch (ex) {
                    const log: DataImportLog = {
                        hasError: true,
                        message: ex.message,
                        file: file,
                        count: 0,
                        definition: definition.name,
                        timestamp: Date.now(),
                        entity: definition.csvOptions.entity,
                    };
                    importLogs.push(log);
                }
            }
        }

        return importLogs;
    }
}

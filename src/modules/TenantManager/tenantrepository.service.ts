import { Injectable } from '@nestjs/common';
import { Repository, getConnectionManager, createConnection, getRepository, Connection } from 'typeorm';
import { Tenant } from '../TenantManager/entities/Tenant.entity';
import { OptimisticLockingSubscriber } from '../../db/events/optimisticLocking.subscriber';
import { TenantManagerHelper } from './utils/TenantManagerHelper';
import { SnakeNamingStrategy } from '../../db/namingStrategies/SnakeNamingStrategy';
import { AudibleEntitySubscriber } from '../../db/events/audibleentity.subscriber';
import { SessionManagerContext } from '../SessionManager/sessionmanager.context';
import { SessionContext } from '../../core';

@Injectable()
export class TenantRepositoryService {
    constructor(private readonly sessionManagerContext: SessionManagerContext, private readonly audibleEntitySubscriber: AudibleEntitySubscriber) {}

    // async getRepository<TEntity>(ctx: Request | MessagePayload, entity: new () => TEntity): Promise<Repository<TEntity>> {
    //     if ((ctx as Request).body) return await this.getTenantRepository(entity);
    //     else if ((ctx as MessagePayload).tenantAlias) return await this.getTenantRepository((ctx as MessagePayload).tenantAlias, entity);
    //     else throw new Error('The request context is not inherited from [Request] or [MessagePayload] interfaces!');
    // }

    async getTenantRepository<TEntity>(entity: new () => TEntity): Promise<Repository<TEntity>> {
        const connection = await this.getTenantConnection();
        return getRepository<TEntity>(entity, connection.name);
    }

    async getTenantConnection(): Promise<Connection> {
        let tenantAlias: string = null;
        try {
            const context: SessionContext = this.sessionManagerContext.get('context');
            tenantAlias = context.tenantAlias;
        } catch (ex) {
            throw new Error(
                'TenantRepositoryService.getTenantConnection() can be used only within an execution context [http request, microservice message, etc.]!',
            );
        }

        const tenant: Tenant = TenantManagerHelper.getTenantConfigByAlias(tenantAlias);

        if (!tenant)
            //TODO: @mso -> Add new Exception class for the below error
            throw new Error(`No tenant aliases found for "${tenantAlias}"!`);

        return await this.getDbConnectionByTenant(tenant);
    }

    async getDbConnectionByTenant(tenant: Tenant) {
        if (!tenant) throw new Error('Cannot create connecton to database because [Tenant] is null!');

        const connectionManager = getConnectionManager();

        if (!connectionManager.has(tenant.code)) {
            const conn = await createConnection({
                name: tenant.code,
                type: 'postgres',
                host: tenant.tenant_db_config.db_host,
                port: tenant.tenant_db_config.db_port,
                username: tenant.tenant_db_config.db_username,
                password: tenant.tenant_db_config.db_password,
                database: tenant.tenant_db_config.db_name,
                entities: ['dist/modules/**/entities/*.js'], //TODO: @mso -> Here an error because it will include also tenant*.js entities, move tenant files out module (maybe a coordinator folder?)
                synchronize: false,
                subscribers: [OptimisticLockingSubscriber],
                // autoLoadEntities: true,
                migrationsTableName: 'db_migration_history',
                migrations: ['dist/db/migrations/*.js'],
                namingStrategy: new SnakeNamingStrategy(),
                entityPrefix: `${global['appModuleName']}_`,
            });
            conn.subscribers.push(this.audibleEntitySubscriber);
            return conn;
        } else {
            return connectionManager.get(tenant.code);
        }
    }
}

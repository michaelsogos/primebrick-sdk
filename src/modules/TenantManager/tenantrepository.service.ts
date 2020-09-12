import { Injectable } from '@nestjs/common';
import { Repository, getConnectionManager, createConnection, getRepository, Connection } from 'typeorm';
import { Tenant } from '../TenantManager/entities/Tenant.entity';
import { OptimisticLockingSubscriber } from '../../db/events/OptimisticLocking.subscriber';
import { TenantManagerHelper } from './utils/TenantManagerHelper';
import { Request } from 'express';
import { MessagePayload } from '../ProcessorManager/models/MessagePayload';
import { SnakeNamingStrategy } from '../../db/namingStrategies/SnakeNamingStrategy';

@Injectable()
export class TenantRepositoryService {
    async getRepository<TEntity>(ctx: Request | MessagePayload, entity: new () => TEntity): Promise<Repository<TEntity>> {
        if ((ctx as Request).body) return await this.getTenantRepository(ctx['tenantAlias'], entity);
        else if ((ctx as MessagePayload).tenantAlias) return await this.getTenantRepository((ctx as MessagePayload).tenantAlias, entity);
        else throw new Error('The request context is not inherited from [Request] or [MessagePayload] interfaces!');
    }

    async getTenantRepository<TEntity>(tenantAlias: string, entity: new () => TEntity): Promise<Repository<TEntity>> {
        const connection = await this.getTenantConnection(tenantAlias);
        return getRepository<TEntity>(entity, connection.name);
    }

    async getTenantConnection(tenantAlias: string): Promise<Connection> {
        const tenant: Tenant = TenantManagerHelper.getTenantConfigByAlias(tenantAlias);

        if (!tenant)
            //TODO: @mso -> Add new Exception class for the below error
            throw new Error(`No tenant aliases found for "${tenantAlias}"!`);

        return await this.getDbConnectionByTenant(tenant);
    }

    async getDbConnectionByTenant(tenant: Tenant) {
        if (!tenant) throw new Error('Cannot instanciate database connection because [Tenant] is null!');

        const connectionManager = getConnectionManager();

        if (!connectionManager.has(tenant.code)) {
            return await createConnection({
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
        } else {
            return connectionManager.get(tenant.code);
        }
    }
}

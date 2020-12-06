import { Injectable } from '@nestjs/common';
import { Repository, getConnectionManager, createConnection, getRepository, Connection, ObjectID, FindConditions, EntityTarget } from 'typeorm';
import { Tenant } from '../TenantManager/entities/Tenant.entity';
import { OptimisticLockingSubscriber } from '../../db/events/optimisticLocking.subscriber';
import { TenantManagerHelper } from './utils/TenantManagerHelper';
import { SnakeNamingStrategy } from '../../db/namingStrategies/SnakeNamingStrategy';
import { AudibleEntitySubscriber } from '../../db/events/audibleentity.subscriber';
import { SessionManagerContext } from '../SessionManager/sessionmanager.context';
import { SessionContext } from '../../core';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { AudibleEntity } from '../../db';

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
        // const repository = getRepository<TEntity>(entity, connection.name);

        return connection.getRepository<TEntity>(entity);
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
        let conn: Connection = null;

        if (!connectionManager.has(tenant.code)) {
            conn = await createConnection({
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
        } else {
            conn = connectionManager.get(tenant.code);
        }

        const self = this;
        conn.getRepository = function <TEntity>(entity: EntityTarget<TEntity>) {
            return self.getSuperRepository<TEntity>(entity, conn.name);
        };
        return conn;
    }

    getSuperRepository<TEntity>(entity, connectionName) {
        const repository = getRepository<TEntity>(entity, connectionName);
        const sessionContext = this.sessionManagerContext;

        const __softDelete = repository.softDelete;
        repository.softDelete = async function (
            criteria: string | number | string[] | number[] | Date | Date[] | ObjectID | ObjectID[] | FindConditions<TEntity>,
        ) {
            let deletedBy = -1;
            try {
                const context = sessionContext.get('context');
                deletedBy = context.userProfile ? context.userProfile.id : -1;
            } catch (ex) {
                deletedBy - 1;
            }
            const entity: QueryDeepPartialEntity<unknown> = { deletedBy: deletedBy };
            await repository.update(criteria, entity);
            return __softDelete(criteria);
        };

        const __update = repository.update;
        repository.update = async function (
            criteria: string | number | string[] | number[] | Date | Date[] | ObjectID | ObjectID[] | FindConditions<TEntity>,
            partialEntity: QueryDeepPartialEntity<TEntity>,
        ) {
            let updatedBy = -1;
            try {
                const context = sessionContext.get('context');
                updatedBy = context.userProfile ? context.userProfile.id : -1;
            } catch (ex) {
                updatedBy - 1;
            }

            partialEntity['updatedBy'] = updatedBy;

            return __update(criteria, partialEntity);
        };

        const __insert = repository.insert;
        repository.insert = async function (entity: QueryDeepPartialEntity<TEntity> | QueryDeepPartialEntity<TEntity>[]) {
            let createdBy = -1;
            let updatedBy = -1;
            try {
                const context = sessionContext.get('context');
                createdBy = context.userProfile ? context.userProfile.id : -1;
                updatedBy = context.userProfile ? context.userProfile.id : -1;
            } catch (ex) {
                createdBy - 1;
                updatedBy - 1;
            }

            entity['createdBy'] = createdBy;
            entity['updatedBy'] = updatedBy;

            return __insert(entity);
        };

        return repository;
    }
}

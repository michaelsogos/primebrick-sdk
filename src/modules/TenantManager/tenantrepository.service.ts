import { Injectable } from '@nestjs/common';
import {
    Repository,
    getConnectionManager,
    createConnection,
    Connection,
    ObjectID,
    FindConditions,
    EntityTarget,
    UpdateResult,
    SaveOptions,
} from 'typeorm';
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
            throw new Error(`Impossible to identify a tenant for alias "${tenantAlias}"!`);

        return await this.getDbConnectionByTenant(tenant);
    }

    async getDbConnectionByTenant(tenant: Tenant) {
        if (!tenant) throw new Error('Cannot create connecton to database because [Tenant] is null!');

        const connectionManager = getConnectionManager();
        let conn: Connection = null;

        if (!connectionManager.has(tenant.code)) {
            if (!process.registeredEntities || process.registeredEntities.length <= 0)
                throw new Error(
                    "There aren't entities to be registered !\nMissing decorator @RegisterEntity(brickName:string) or never imported entity anywhere ?",
                );

            const registeredEntitiesForBrick = process.registeredEntities
                .filter((item) => item.brickName == process.brickName)
                .map((item) => item.entity);

            conn = await createConnection({
                name: tenant.code,
                type: 'postgres',
                host: tenant.tenant_db_config.db_host,
                port: tenant.tenant_db_config.db_port,
                username: tenant.tenant_db_config.db_username,
                password: tenant.tenant_db_config.db_password,
                database: tenant.tenant_db_config.db_name,
                entities: registeredEntitiesForBrick, //['dist/modules/**/entities/*.js'],
                synchronize: false,
                subscribers: [OptimisticLockingSubscriber],
                // autoLoadEntities: true,
                migrationsTableName: 'db_migration_history',
                migrations: ['dist/db/migrations/*.js'],
                namingStrategy: new SnakeNamingStrategy(),
                entityPrefix: `${process.brickName}_`,
            });
            conn.subscribers.push(this.audibleEntitySubscriber);
        } else {
            conn = connectionManager.get(tenant.code);
        }

        const self = this;
        const __getRepository = conn.getRepository;
        conn.getRepository = function <TEntity>(entity: EntityTarget<TEntity>) {
            const repository = __getRepository.apply(conn, [entity]);
            return self.overrideRepository<TEntity>(repository);
        };
        return conn;
    }

    overrideRepository<TEntity>(repository: Repository<TEntity>) {
        const sessionContext = this.sessionManagerContext;
        let currentUser = -1;
        try {
            const context = sessionContext.get('context');
            currentUser = context.userProfile ? context.userProfile.id : -1;
        } catch (ex) {
            currentUser - 1;
        }

        const __update = repository.update;
        repository.update = async function (
            criteria: string | number | string[] | number[] | Date | Date[] | ObjectID | ObjectID[] | FindConditions<TEntity>,
            partialEntity: QueryDeepPartialEntity<TEntity>,
        ) {
            partialEntity['updatedBy'] = currentUser;
            return __update.apply(repository, [criteria, partialEntity]);
        };

        //const __softDelete = repository.softDelete;
        repository.softDelete = async function (
            criteria: string | number | string[] | number[] | Date | Date[] | ObjectID | ObjectID[] | FindConditions<TEntity>,
        ): Promise<UpdateResult> {
            const partialEntity: QueryDeepPartialEntity<unknown> = { deletedBy: currentUser, deletedOn: new Date(), updatedBy: currentUser };
            return __update.apply(repository, [criteria, partialEntity]);
            // return __softDelete.apply(repository, [criteria]);
        };

        const __insert = repository.insert;
        repository.insert = async function (entity: QueryDeepPartialEntity<TEntity> | QueryDeepPartialEntity<TEntity>[]) {
            entity['createdBy'] = currentUser;
            entity['updatedBy'] = currentUser;

            return __insert.apply(repository, [entity]);
        };

        const __save = repository.save;
        const __softRemove = repository.softRemove;
        repository.softRemove = function <TEntity>(
            entityOrEntities: QueryDeepPartialEntity<TEntity> | QueryDeepPartialEntity<TEntity>[],
            options: SaveOptions,
        ) {
            options.data = { action: 'soft-remove' };

            if (Array.isArray(entityOrEntities)) {
                const audibleEntities: AudibleEntity[] = [];
                const notAudibleEntities: QueryDeepPartialEntity<TEntity>[] = [];

                for (const entity of entityOrEntities) {
                    if (entity instanceof AudibleEntity) {
                        entity.deletedOn = new Date();
                        audibleEntities.push(entity);
                    } else notAudibleEntities.push(entity);
                }

                if (audibleEntities.length > 0) return __save.apply(repository, [audibleEntities, options]);
                if (notAudibleEntities.length > 0) return __softRemove.apply(repository, [notAudibleEntities, options]);
            } else {
                if (entityOrEntities instanceof AudibleEntity) {
                    entityOrEntities.deletedOn = new Date();
                    return __save.apply(repository, [entityOrEntities, options]);
                } else return __softRemove.apply(repository, [entityOrEntities, options]);
            }
        };

        return repository;
    }
}

import { Injectable } from '@nestjs/common';
import {
  Repository,
  getConnectionManager,
  createConnection,
  getRepository,
} from 'typeorm';
import { TenantConfig } from '../TenantManager/entities/TenantConfig.entity';
import { OptimisticLockingSubscriber } from '../../db/events/OptimisticLocking.subscriber';
import { TenantManagerHelper } from './utils/TenantManagerHelper';
import { Request } from 'express';
import { MessagePayload } from '../ProcessorManager/models/MessagePayload';

@Injectable()
export class TenantRepositoryService {
  async getTenantRepository<TEntity>(
    tenantAlias: string,
    entity: new () => TEntity,
  ): Promise<Repository<TEntity>> {
    const tenantConfig: TenantConfig = TenantManagerHelper.getTenantConfigByAlias(
      tenantAlias,
    );

    if (!tenantConfig)
      //TODO: @mso -> Add new Exception class for the below error
      throw new Error(`No tenant aliases found for "${tenantAlias}"!`);

    const connectionManager = getConnectionManager();

    if (!connectionManager.has(tenantConfig.code))
      await createConnection({
        name: tenantConfig.code,
        type: 'postgres',
        host: tenantConfig.db_host,
        port: tenantConfig.db_port,
        username: tenantConfig.db_username,
        password: tenantConfig.db_password,
        database: tenantConfig.db_name,
        entities: ['dist/modules/**/entities/*.js'], //TODO: @mso -> Here an error because it will include also tenant*.js entities, move tenant files out module (maybe a coordinator folder?)
        synchronize: false,
        subscribers: [OptimisticLockingSubscriber],
        // autoLoadEntities: true,
        migrationsTableName: 'db_migration_history',
        migrations: ['dist/migrations/coordinator/*.js'],
        cli: {
          migrationsDir: 'src/migrations/coordinator',
        },
      });

    return getRepository<TEntity>(entity, tenantConfig.code);
  }

  async getRepository<TEntity>(
    ctx: Request | MessagePayload,
    entity: new () => TEntity,
  ): Promise<Repository<TEntity>> {
    if ((ctx as Request).body)
      return await this.getTenantRepository(ctx['tenantAlias'], entity);
    else if ((ctx as MessagePayload).tenantAlias)
      return await this.getTenantRepository(
        (ctx as MessagePayload).tenantAlias,
        entity,
      );
    else
      throw new Error(
        'The request context is not inherited from [Request] or [RequestContext] interfaces!',
      );
  }
}

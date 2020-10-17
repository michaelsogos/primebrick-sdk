import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from './models/primebrick.config';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    constructor(private readonly configService: ConfigService) {}

    createTypeOrmOptions(): TypeOrmModuleOptions {
        const connectionConfig = this.configService.get<DatabaseConfig>('database');
        const typeOrmConfig: TypeOrmModuleOptions = {
            type: 'postgres',
            entities: ['dist/modules/TenantManager/entities/*.js'],
            synchronize: false,
            subscribers: [],
            autoLoadEntities: true,
            migrationsTableName: 'db_migration_history',
            migrations: ['dist/migrations/coordinator/*.js'],
            cli: {
                migrationsDir: 'src/migrations/coordinator',
            },
        };

        return Object.assign(typeOrmConfig, connectionConfig);
    }
}

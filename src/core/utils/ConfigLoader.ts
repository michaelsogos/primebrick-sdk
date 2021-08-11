import { PrimebrickConfig } from '../models/primebrick.config';

export function ConfigLoader(): PrimebrickConfig {
    return {
        app: {
            port: parseInt(process.env.PORT, 10) || 3000,
            requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10) || 5000,
            scheduler: {
                tenantsLoader: parseInt(process.env.SCHEDULE_TENANTS_LOADER, 10) || 300000,
            },
            natsUrl: process.env.NATS_URL || 'nats://localhost:4222',
        },
        database: {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT, 10) || 5432,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        },
    };
}

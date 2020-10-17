export interface PrimebrickConfig {
    app: AppConfig;
    database: DatabaseConfig;
}

export interface DatabaseConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
}

export interface AppConfig {
    port: number;
    scheduler: {
        tenantsLoader: number;
    };
}

export function loadConfig(): PrimebrickConfig {
    return {
        app: {
            port: parseInt(process.env.PORT, 10) || 3000,
            scheduler: {
                tenantsLoader: parseInt(process.env.SCHEDULE_TENANTS_LOADER, 10) || 300000,
            },
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

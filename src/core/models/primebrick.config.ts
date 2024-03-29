import { RegisteredEntity } from "./RegisteredEntity";

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
    requestTimeout: number;
    scheduler: {
        tenantsLoader: number;
    };
    natsUrl: string;
}

declare global {
    namespace NodeJS {
        interface Process {
            brickName: string;
            registeredEntities: RegisteredEntity[];
        }
    }
}
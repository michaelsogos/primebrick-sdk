import { RegisteredEntity } from './core/models/RegisteredEntity';

declare global {
    namespace NodeJS {
        interface Process {
            brickName: string;
            registeredEntities: RegisteredEntity[];
        }
    }
}

export {};

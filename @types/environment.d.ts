import { RegisteredEntity } from '../dist/core/models/RegisteredEntity';

declare global {
    namespace NodeJS {
        interface Process {
            brickName: string;
            registeredEntities: RegisteredEntity[];
        }
    }
}

export {};

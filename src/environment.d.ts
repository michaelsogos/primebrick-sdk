import { RegisteredEntity } from './core/models/RegisteredEntity';

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            [key: string]: any;
            BRICK_NAME: string;
            REGISTERED_ENTITIES: RegisteredEntity[];
        }
    }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};

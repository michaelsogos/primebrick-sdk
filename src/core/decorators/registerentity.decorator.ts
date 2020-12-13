import { RegisteredEntity } from '../models/RegisteredEntity';

export function RegisterEntity(brickName: string) {
    if (process.env.REGISTERED_ENTITIES == null) process.env.REGISTERED_ENTITIES = [];

    return function (constructor: Function): any {
        process.env.REGISTERED_ENTITIES.push(new RegisteredEntity(constructor.name, brickName, constructor));
    };
}

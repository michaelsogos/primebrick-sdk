import { RegisteredEntity } from '../models/RegisteredEntity';

export function RegisterEntity(brickName: string) {
    if (process.registeredEntities == null) process.registeredEntities = [];

    return function (constructor: Function): any {
        if (!brickName)
            throw new Error(
                `Cannot register entity [${constructor.name}] with empty or invalid brick name! RegisterEntity({brickName}) must receive valid brick name.`,
            );
        process.registeredEntities.push(new RegisteredEntity(constructor.name, brickName, constructor));
    };
}

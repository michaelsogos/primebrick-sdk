import { RegisteredEntity } from '../models/RegisteredEntity';

export function RegisterEntity(brickName: string) {
    if (global['registeredEntities'] == null) global['registeredEntities'] = [];

    return function (constructor: Function): any {
        //constructor.prototype.brickModuleName = brickModuleName;
        global['registeredEntities'].push(new RegisteredEntity(constructor.name, brickName, constructor));
    };
}

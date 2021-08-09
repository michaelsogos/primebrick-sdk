import { RegisteredEntity } from '../models/RegisteredEntity';
import * as fs from 'fs';
import * as path from 'path';
import { CommonHelper } from '../utils/CommonHelper';

export function MainBoot(brickName: string, options: { startMethod: string }): Function {
    if (!brickName) throw new Error("Cannot boot up application because brick name not definded! Maybe @MainBoot('brick name') missing!");
    if (process.registeredEntities == null) process.registeredEntities = [];
    options.startMethod = options.startMethod || 'start';

    process.brickName = brickName;
    const basePath = path.join(process.cwd(), CommonHelper.isDebugMode() ? 'dist' : '', 'modules');

    for (const moduleFolder of fs.readdirSync(basePath)) {
        const modulePath = path.join(basePath, moduleFolder, 'entities');
        if (fs.existsSync(modulePath))
            for (const entiyFileName of fs.readdirSync(modulePath).filter((fn) => /[entity|view]\.js$/.test(fn))) {
                const entityFilePath = path.join(modulePath, entiyFileName);
                const loadedEntity = require(entityFilePath);
                const exportedObjectsName = Object.keys(loadedEntity);
                if (exportedObjectsName.length != 1) throw new Error(`Entity file "${entityFilePath}" must export only one entity class definition!`);
                const entity = loadedEntity[exportedObjectsName[0]];
                process.registeredEntities.push(new RegisteredEntity(entity.name, brickName, entity));
            }
    }

    return function (constructor: Function): any {
        if (!constructor[options.startMethod]) throw new Error(`Missing ${options.startMethod}() method!`);
        constructor[options.startMethod]();
    };
}

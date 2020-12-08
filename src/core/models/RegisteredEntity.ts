export class RegisteredEntity {
    entityName: string;
    brickName: string;
    entity: any;

    constructor(entityName: string, brickName: string, entity: any) {
        this.entityName = entityName;
        this.brickName = brickName;
        this.entity = entity;
    }
}

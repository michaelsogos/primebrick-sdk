import { ExecutionContext } from '@nestjs/common';
import { UserProfile } from '../../modules/AuthManager/models/UserProfile';
import { Request } from 'express';
import { Connection } from 'typeorm';
import { ImporterCardinalityType, ImporterDefinition } from '../models/ImporterDescriptor';
import { SessionContext } from '../models/SessionContext';
import { TenantManagerHelper } from '../../modules/TenantManager/utils/TenantManagerHelper';
import { AuthManagerHelper } from '../../modules/AuthManager/utils/AuthManagerHelper';
import { MessagePayload } from '../../modules';
import { DataImportLog } from '../models/DataImportLog';
import { RegisteredEntity } from '../models/RegisteredEntity';

export class CommonHelper {
    static getLanguageCodeFromExecutionContext(context: ExecutionContext, userProfile: UserProfile): string {
        switch (context.getType()) {
            case 'http':
                return this.getLanguageCodeFromHttpRequest(context.switchToHttp().getRequest(), userProfile);
            case 'rpc':
                return this.getLanguageCodeFromRpcRequest(context.switchToRpc().getData(), userProfile);
            case 'ws':
                throw new Error('Not implemented yet!');
        }
    }

    static getLanguageCodeFromHttpRequest(request: Request, userProfile: UserProfile): string {
        if (userProfile && userProfile.languageCode) return userProfile.languageCode;

        const acceptedLanguages = request.acceptsLanguages();
        let languageCode: string = null;

        if (acceptedLanguages) languageCode = acceptedLanguages[0].split('-')[0];
        if (!languageCode || languageCode == '*') languageCode = 'en';

        return languageCode;
    }

    static getLanguageCodeFromRpcRequest(request: MessagePayload<any>, userProfile: UserProfile): string {
        if (userProfile && userProfile.languageCode) return userProfile.languageCode;
        else if (request && request.context && request.context.languageCode) return request.context.languageCode;
        else return 'en';
    }

    static async importData(dbconn: Connection, data: unknown[], definition: ImporterDefinition, file: string) {
        const repository = dbconn.getRepository(definition.csvOptions.entity);
        const entities = [];

        for (let x = 0; x < data.length; x++) {
            const record: any = data[x];
            let entity = repository.create();

            //Make where conditions to find exsiting entity
            if (definition.csvOptions.checkColumns && definition.csvOptions.checkColumns.length > 0) {
                const findConditions = {};
                for (const checkColumn of definition.csvOptions.checkColumns) {
                    const mapping = !definition.csvOptions.columnsMapping
                        ? null
                        : definition.csvOptions.columnsMapping.find((item) => item.column == checkColumn);

                    if (!mapping && Object.prototype.hasOwnProperty.call(record, checkColumn)) findConditions[checkColumn] = record[checkColumn];
                    else if (mapping && Object.prototype.hasOwnProperty.call(record, checkColumn))
                        findConditions[mapping.field] = record[checkColumn];
                    else
                        throw new Error(
                            `Cannot find check column [${checkColumn}].\nIt should be defined as mapped column or at least should be the name of existing csv column!`,
                        );
                }

                const sourceEntity = await repository.findOne(null, {
                    where: findConditions,
                });

                if (sourceEntity) entity = sourceEntity;
            }

            //Set entity fields upon mapping or by csv column name
            if (definition.csvOptions.columnsMapping && definition.csvOptions.columnsMapping.length > 0)
                for (const mapping of definition.csvOptions.columnsMapping) {
                    if (!Object.prototype.hasOwnProperty.call(record, mapping.column))
                        throw new Error(`Cannot find column [${mapping.column}] at line ${x + 1}!`);

                    entity[mapping.field] = record[mapping.column]; //TODO: @mso -> Add a "transformer/parser/transpiler/custom logic" method or expression in mapping in order to handle DTO logic before assign value to entity field
                }
            else {
                for (const field in record) {
                    if (!field.startsWith('$') && Object.prototype.hasOwnProperty.call(record, field)) entity[field] = record[field];
                }
            }

            if (repository.metadata.columns.some((column) => column.propertyName == 'importedBy')) entity['importedBy'] = -1; //TODO: @mso -> Collect from context the LOGGED IN USER ID
            if (repository.metadata.columns.some((column) => column.propertyName == 'importedOn')) entity['importedOn'] = new Date();
            entities.push(entity);
        }

        //Import cardinal relations
        if (definition.csvOptions.cardinalRelations && definition.csvOptions.cardinalRelations.length > 0) {
            for (const cardinalRelation of definition.csvOptions.cardinalRelations) {
                const targetEntityRepository = dbconn.getRepository(cardinalRelation.targetEntity);

                const recordsToLink = new Map(
                    data
                        .filter((record) => record[cardinalRelation.targetKeyColumn])
                        .map((record) => [
                            `${record[cardinalRelation.targetKeyColumn]}_${record[cardinalRelation.sourceKeyColumn]}`,
                            {
                                targetValue: record[cardinalRelation.targetKeyColumn],
                                sourceValue: record[cardinalRelation.sourceKeyColumn],
                            },
                        ]),
                ).values();

                for (const record of recordsToLink) {
                    const findConditions = {};
                    findConditions[cardinalRelation.targetKeyField] = record.targetValue;

                    let target: any = null;
                    if (
                        cardinalRelation.cardinality == ImporterCardinalityType.oneToMany ||
                        cardinalRelation.cardinality == ImporterCardinalityType.manyToMany
                    )
                        target = await targetEntityRepository.find({
                            where: findConditions,
                        });
                    else if (
                        cardinalRelation.cardinality == ImporterCardinalityType.oneToOne ||
                        cardinalRelation.cardinality == ImporterCardinalityType.manyToOne
                    )
                        target = await targetEntityRepository.findOneOrFail({
                            where: findConditions,
                        });

                    const sourceKeyField = definition.csvOptions.columnsMapping
                        ? definition.csvOptions.columnsMapping.find((mapping) => mapping.column == cardinalRelation.sourceKeyColumn).field
                        : cardinalRelation.sourceKeyColumn;

                    for (let x = 0; x < entities.length; x++) {
                        if (entities[x][sourceKeyField] == record.sourceValue) {
                            const entity = entities[x];

                            if (
                                cardinalRelation.cardinality == ImporterCardinalityType.oneToMany ||
                                cardinalRelation.cardinality == ImporterCardinalityType.manyToMany
                            ) {
                                if (!Object.prototype.hasOwnProperty.call(entity, cardinalRelation.sourceRelationField))
                                    entity[cardinalRelation.sourceRelationField] = [];
                                entity[cardinalRelation.sourceRelationField].push(...target);
                            } else if (
                                cardinalRelation.cardinality == ImporterCardinalityType.oneToOne ||
                                cardinalRelation.cardinality == ImporterCardinalityType.manyToOne
                            ) {
                                entity[cardinalRelation.sourceRelationField] = target;
                            }

                            if (
                                cardinalRelation.cardinality == ImporterCardinalityType.oneToOne ||
                                cardinalRelation.cardinality == ImporterCardinalityType.oneToMany
                            )
                                break;
                        }
                    }
                }
            }
        }

        let savedEntitiesCount = 0;
        const savedParents = [];

        //Import circular relation
        if (definition.csvOptions.circularRelation) {
            const circularRelation = definition.csvOptions.circularRelation;
            const recordsToLink = data.filter((record) => record[circularRelation.parentColumn]);

            for (const record of recordsToLink) {
                let parentEntity = savedParents.find((parent) => parent[circularRelation.mappedByColumn] == record[circularRelation.parentColumn]);

                if (!parentEntity) {
                    const parentEntityIndex = entities.findIndex(
                        (entity) => entity[circularRelation.mappedByColumn] == record[circularRelation.parentColumn],
                    );
                    parentEntity = entities[parentEntityIndex];
                    parentEntity = await repository.save(parentEntity);
                    savedEntitiesCount++;
                    savedParents.push(parentEntity);
                    entities.splice(parentEntityIndex, 1);
                }

                const childKeyField = definition.csvOptions.columnsMapping
                    ? definition.csvOptions.columnsMapping.find((mapping) => mapping.column == circularRelation.childKeyColumn).field
                    : circularRelation.childKeyColumn;

                const childEntityIndex = entities.findIndex((entity) => entity[childKeyField] == record[circularRelation.childKeyColumn]);
                if (childEntityIndex >= 0) entities[childEntityIndex][circularRelation.parentField] = parentEntity;
            }
        }

        //TODO: @michaelsogos -> find a way to save only entities that has been really changed; actually every imported entity will be updated even if already exists
        const savedEntities = await repository.save(entities, { chunk: definition.chunkSize || 1000 });
        savedEntitiesCount += savedEntities.length;

        if (definition.csvOptions.circularRelation && repository.metadata.treeType && repository.metadata.treeType == 'closure-table')
            for (const entity of savedEntities) {
                const metadata = repository.metadata.closureJunctionTable;
                const ancestorColumnName = metadata.ancestorColumns[0].databaseName;
                const descendantColumnName = metadata.descendantColumns[0].databaseName;
                const sql = `
                            INSERT INTO "${metadata.name}" ("${ancestorColumnName}", "${descendantColumnName}")
                            VALUES ($1, $2)
                            ON CONFLICT ("${ancestorColumnName}", "${descendantColumnName}") DO 
                            UPDATE SET "${ancestorColumnName}" = $1;`;

                await repository.query(sql, [entity[definition.csvOptions.circularRelation.parentField].id, entity.id]);
            }

        const log: DataImportLog = {
            hasError: false,
            message: `Import succeded`,
            file: file,
            count: savedEntitiesCount,
            definition: definition.name,
            timestamp: Number(Date.now),
            entity: definition.csvOptions.entity,
        };

        return log;
    }

    static isDebugMode() {
        return !process.env.NODE_ENV || process.env.NODE_ENV != 'production';
    }

    static getContextFromExecutionContext(context: ExecutionContext) {
        switch (context.getType()) {
            case 'http':
                return this.getContextFromHttpRequest(context.switchToHttp().getRequest());
            case 'rpc':
                return this.getContextFromRpcRequest(context.switchToRpc().getData());
            case 'ws':
                throw new Error('Not implemented yet!');
        }
    }

    static getContextFromHttpRequest(request: Request) {
        const result = new SessionContext();
        result.tenantAlias = TenantManagerHelper.getTenantAliasFromHttpRequest(request);
        try {
            result.userProfile = AuthManagerHelper.getUserProfileFromHttpRequest(request);
        } catch (err) {
            result.userProfile = null;
        }
        result.languageCode = this.getLanguageCodeFromHttpRequest(request, result.userProfile);
        return result;
    }

    static getContextFromRpcRequest(request: MessagePayload<any>) {
        return request.context;
    }

    static getRegisteredEntities(): string[] {
        const entities: string[] = [];
        for (const registeredEntity of process.registeredEntities) {
            entities.push(registeredEntity.entityName);
        }

        return entities;
    }

    static isEntityRegistered(entityName: string): boolean {
        return process.registeredEntities.some((item) => item.entityName == entityName);
    }
}

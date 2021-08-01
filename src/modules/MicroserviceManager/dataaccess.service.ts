import { Injectable } from '@nestjs/common';
import {
    QueryPayload,
    QueryFilterOperator,
    QuerySortDirection,
    QueryJoinType,
    QueryJoin,
    QueryJoinCondition,
    QueryField,
    QueryShowArchivedEntity,
} from './models/QueryPayload';
import { QueryResult } from './models/QueryResult';
import { Brackets, SelectQueryBuilder } from 'typeorm';
import { TenantRepositoryService } from '../TenantManager/tenantrepository.service';
import { AdvancedLogger } from '../../core/logger.service';

@Injectable()
export class DataAccessService {
    constructor(private readonly repositoryService: TenantRepositoryService, private readonly logger: AdvancedLogger) {
        logger.setContext(DataAccessService.name);
    }

    async find(query: QueryPayload): Promise<QueryResult> {
        const queryBuilder = await this.getQueryBuilder(query);

        const result = await queryBuilder.getManyAndCount();
        this.logger.debug(result[1].toString());
        return new QueryResult(result[0], result[1]);
    }

    async findOne(query: QueryPayload): Promise<QueryResult> {
        const queryBuilder = await this.getQueryBuilder(query);

        const result = await queryBuilder.getOne();
        return new QueryResult([result], 1);
    }

    private async getQueryBuilder(query: QueryPayload): Promise<SelectQueryBuilder<unknown>> {
        if (!query.brick) throw new Error('Cannot execute query with empty or invalid brick name!');
        if (!query.entity) throw new Error('Cannot execute query with empty or invalid entity name!');

        const dbconn = await this.repositoryService.getTenantConnection();
        const queryBuilder = dbconn.createQueryBuilder(query.entity, query.entity);

        if (query.fields && query.fields.length > 0) {
            queryBuilder.select([`${query.entity}.id`]);
            for (const field of query.fields) {
                if (typeof field === 'string') queryBuilder.addSelect(`${query.entity}.${field}`);
                else queryBuilder.addSelect(field.expression.replace('$self', query.entity), field.alias);
            }
        }

        if (query.joins && query.joins.length > 0)
            for (const join of query.joins) {
                switch (join.type) {
                    case QueryJoinType.INNER:
                        {
                            queryBuilder.innerJoin(
                                join.entity,
                                join.alias,
                                join.condition.expression.replace('$self', query.entity),
                                join.condition.expressionValues,
                            );
                        }
                        break;
                    case QueryJoinType.LEFT:
                        {
                            queryBuilder.leftJoin(
                                join.entity,
                                join.alias,
                                join.condition.expression.replace('$self', query.entity),
                                join.condition.expressionValues,
                            );
                        }
                        break;
                }

                for (const field of join.fields) {
                    if (typeof field === 'string') queryBuilder.addSelect(`${join.alias}.${field}`);
                    else queryBuilder.addSelect(field.expression.replace('$self', query.entity), field.alias);
                }
            }

        if (query.filters && query.filters.length > 0) {
            for (const filter of query.filters) {
                if (filter.leftOperator && filter.leftOperator == QueryFilterOperator.OR)
                    queryBuilder.orWhere(
                        new Brackets((qb) => {
                            for (const condition of filter.expressions) {
                                if (filter.expressionOperator && filter.expressionOperator == QueryFilterOperator.OR)
                                    qb.orWhere(condition.replace('$self', query.entity), filter.expressionValues || null);
                                else qb.andWhere(condition.replace('$self', query.entity), filter.expressionValues || null);
                            }
                        }),
                    );
                else
                    queryBuilder.andWhere(
                        new Brackets((qb) => {
                            for (const condition of filter.expressions) {
                                if (filter.expressionOperator && filter.expressionOperator == QueryFilterOperator.OR)
                                    qb.orWhere(condition.replace('$self', query.entity), filter.expressionValues || null);
                                else qb.andWhere(condition.replace('$self', query.entity), filter.expressionValues || null);
                            }
                        }),
                    );
            }
        }

        if (query.showArchivedEntities == QueryShowArchivedEntity.ALSO) queryBuilder.withDeleted();
        else if (query.showArchivedEntities == QueryShowArchivedEntity.ONLY)
            queryBuilder.withDeleted().andWhere(`${query.entity}.deletedOn is not null`);

        if (query.sorts) {
            queryBuilder.orderBy();
            for (const sort of query.sorts)
                queryBuilder.addOrderBy(
                    `${query.entity}.${sort.field}`,
                    sort.direction || QuerySortDirection.ASC,
                    !sort.direction || sort.direction == QuerySortDirection.ASC ? 'NULLS LAST' : 'NULLS FIRST',
                );
        }

        if (query.take) queryBuilder.take(query.take);

        if (query.skip) queryBuilder.skip(query.skip);

        return queryBuilder;
    }

    async save(entityName: string, entity: unknown): Promise<QueryResult> {
        const dbconn = await this.repositoryService.getTenantConnection();
        const repository = dbconn.getRepository(entityName);
        const result = await repository.save(repository.create(entity));
        return new QueryResult([result], 1);
    }

    async delete(entityName: string, entityId: number, isRecoverable: boolean = true): Promise<QueryResult> {
        const dbconn = await this.repositoryService.getTenantConnection();
        const repository = dbconn.getRepository(entityName);
        let entityBackup = null;
        if (isRecoverable) entityBackup = await repository.findOne(entityId);
        const result = await repository.delete(entityId);
        if (result.affected != 1) throw new Error(`No record to delete found for entity "${entityName}" with ID {${entityId}}!`);
        return new QueryResult(isRecoverable ? [entityBackup] : [], result.affected);
    }

    async deleteMany(entityName: string, entityIds: number[]): Promise<QueryResult> {
        const dbconn = await this.repositoryService.getTenantConnection();
        const repository = dbconn.getRepository(entityName);

        //FIXME: @mso -> Typeorm actually doesn't support for DeleteOptions in order to play with chunck size
        //That's why we use remove() method making useless fake entities
        const fakeEntities = [];
        for (const id of entityIds) {
            const fakeEntity = repository.create();
            fakeEntity['id'] = id;
            fakeEntities.push(fakeEntity);
        }

        const result = await repository.remove(fakeEntities, { chunk: 1000 });
        return new QueryResult([], result.length);
    }

    async archive(entityName: string, entityId: number): Promise<QueryResult> {
        const dbconn = await this.repositoryService.getTenantConnection();
        const repository = dbconn.getRepository(entityName);
        const result = await repository.softDelete(entityId);
        if (result.affected != 1) throw new Error(`No record to archive found for entity "${entityName}" with ID {${entityId}}!`);
        return new QueryResult([], result.affected);
    }

    async archiveMany(entityName: string, entityIds: number[]): Promise<QueryResult> {
        const dbconn = await this.repositoryService.getTenantConnection();
        const repository = dbconn.getRepository(entityName);

        //FIXME: @mso -> Typeorm actually doesn't support for SoftDeleteOptions in order to play with chunck size
        //That's why we use remove() method making useless fake entities
        const fakeEntities = [];
        for (const id of entityIds) {
            const fakeEntity = repository.create();
            fakeEntity['id'] = id;
            fakeEntities.push(fakeEntity);
        }

        const result = await repository.softRemove(fakeEntities, { chunk: 1000 });
        return new QueryResult([], result.length);
    }

    async info(query: QueryPayload): Promise<QueryResult> {
        query.fields = [];
        const versionField = new QueryField();
        versionField.expression = '$self.version';
        versionField.alias = 'version';
        const createdOnField = new QueryField();
        createdOnField.expression = '$self.createdOn';
        createdOnField.alias = 'createdOn';
        const updatedOnField = new QueryField();
        updatedOnField.expression = '$self.updatedOn';
        updatedOnField.alias = 'updatedOn';
        const deletedOnField = new QueryField();
        deletedOnField.expression = '$self.deletedOn';
        deletedOnField.alias = 'deletedOn';
        const importedOnField = new QueryField();
        importedOnField.expression = '$self.importedOn';
        importedOnField.alias = 'importedOn';
        query.fields.push(...[versionField, createdOnField, updatedOnField, deletedOnField, importedOnField]);

        query.joins = [];
        const ownerJoin = new QueryJoin();
        ownerJoin.entity = 'User';
        ownerJoin.alias = 'owner';
        ownerJoin.type = QueryJoinType.LEFT;
        const ownerJoinCondition = new QueryJoinCondition();
        ownerJoinCondition.expression = `owner.id = $self.createdBy`;
        ownerJoin.condition = ownerJoinCondition;
        const ownerNameField = new QueryField();
        ownerNameField.expression = "(owner.firstName || ' ' || owner.lastName)";
        ownerNameField.alias = 'createdBy';
        ownerJoin.fields = [ownerNameField];
        query.joins.push(ownerJoin);

        const editorJoin = new QueryJoin();
        editorJoin.entity = 'User';
        editorJoin.alias = 'editor';
        editorJoin.type = QueryJoinType.LEFT;
        const editorJoinCondition = new QueryJoinCondition();
        editorJoinCondition.expression = `editor.id = $self.updatedBy`;
        editorJoin.condition = editorJoinCondition;
        const editorNameField = new QueryField();
        editorNameField.expression = "(editor.firstName || ' ' || editor.lastName)";
        editorNameField.alias = 'updatedBy';
        editorJoin.fields = [editorNameField];
        query.joins.push(editorJoin);

        const deleterJoin = new QueryJoin();
        deleterJoin.entity = 'User';
        deleterJoin.alias = 'deleter';
        deleterJoin.type = QueryJoinType.LEFT;
        const deleterJoinCondition = new QueryJoinCondition();
        deleterJoinCondition.expression = `deleter.id = $self.deletedBy`;
        deleterJoin.condition = deleterJoinCondition;
        const deleterNameField = new QueryField();
        deleterNameField.expression = "(deleter.firstName || ' ' || deleter.lastName)";
        deleterNameField.alias = 'deletedBy';
        deleterJoin.fields = [deleterNameField];
        query.joins.push(deleterJoin);

        const importerJoin = new QueryJoin();
        importerJoin.entity = 'User';
        importerJoin.alias = 'importer';
        importerJoin.type = QueryJoinType.LEFT;
        const importerJoinCondition = new QueryJoinCondition();
        importerJoinCondition.expression = `importer.id = $self.importedBy`;
        importerJoin.condition = importerJoinCondition;
        const importerNameField = new QueryField();
        importerNameField.expression = "(importer.firstName || ' ' || importer.lastName)";
        importerNameField.alias = 'importedBy';
        importerJoin.fields = [importerNameField];
        query.joins.push(importerJoin);

        const queryBuilder = await this.getQueryBuilder(query);

        const result = await queryBuilder.getRawOne();
        return new QueryResult([result], 1);
    }
}

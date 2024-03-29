export class QueryPayload {
    brick: string;
    entity: string;
    fields: (string | QueryField)[];
    showArchivedEntities: QueryShowArchivedEntity;
    filters: QueryFilter[];
    sorts: QuerySort[];
    take: number;
    skip: number;
    joins: QueryJoin[];
    excludeIDField: boolean;
}

export class QueryFilter {
    leftOperator: QueryFilterOperator;
    expressionOperator: QueryFilterOperator;
    expressions: string[];
    expressionValues: any;
}

export class QuerySort {
    field: string;
    direction: QuerySortDirection;
}

export class QueryJoin {
    type: QueryJoinType;
    entity: string;
    alias: string;
    condition: QueryJoinCondition;
    fields: (string | QueryField)[];
}

export class QueryField {
    expression: string;
    alias: string;
}

export class QueryJoinCondition {
    expression: string;
    expressionValues: any;
}

export enum QueryFilterOperator {
    AND = 'AND',
    OR = 'OR',
}

export enum QuerySortDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

export enum QueryJoinType {
    LEFT = 'LEFT',
    INNER = 'INNER',
}

export enum QueryShowArchivedEntity {
    NONE = 'none',
    ONLY = 'only',
    ALSO = 'also',
}

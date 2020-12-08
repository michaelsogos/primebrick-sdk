export class QueryPayload {
    entity: string;
    fields: (string | QueryField)[];
    filters: QueryFilter[];
    sorts: QuerySort[];
    take: number;
    skip: number;
    joins: QueryJoin[];
}

class QueryFilter {
    leftOperator: QueryFilterOperator;
    expressionOperator: QueryFilterOperator;
    expressions: string[];
    expressionValues: any;
}

class QuerySort {
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

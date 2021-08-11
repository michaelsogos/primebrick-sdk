export class QueryResult {
    data: any[];
    count: number;

    constructor(data: any[], count: number) {
        this.data = data;
        this.count = count;
    }
}

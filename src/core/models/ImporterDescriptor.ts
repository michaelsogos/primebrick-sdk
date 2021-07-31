export class ImporterDescriptor {
    version: string;
    defs: ImporterDefinition[];

    static mapDelimiterToChar(delimiter?: ImporterCsvSeparatorType): string {
        switch (delimiter) {
            case ImporterCsvSeparatorType.comma:
                return ',';
            case ImporterCsvSeparatorType.semicolon:
                return ';';
            case ImporterCsvSeparatorType.tab:
                return '\t';
            default:
                return null;
        }
    }
}

export class ImporterDefinition {
    name: string;
    files: string[];
    type: ImporterDefinitionFileType;
    chunkSize: number;
    csvOptions: ImporterCsvOptions;
    disableUpdate: boolean;
}

class ImporterCsvOptions {
    entity: string;
    encoding: ImporterCsvFileEncoding;
    delimiter?: ImporterCsvSeparatorType;
    columnsMapping: ImporterColumnMapping[];
    header: boolean;
    checkColumns: string[];
    quoteChar: string;
    circularRelation: ImporterCircularRelation;
    cardinalRelations: ImporterCardinalRelations[];
}

class ImporterColumnMapping {
    column: string;
    field: string;
}

class ImporterCircularRelation {
    parentColumn: string;
    mappedByColumn: string;
    childKeyColumn: string;
    parentField: string;
}

class ImporterCardinalRelations {
    cardinality: ImporterCardinalityType;
    targetEntity: string;
    targetKeyColumn: string;
    sourceKeyColumn: string;
    targetKeyField: string;
    sourceRelationField: string;
}

enum ImporterDefinitionFileType {
    csv,
    json,
    xml,
}

enum ImporterCsvSeparatorType {
    none,
    comma,
    semicolon,
    tab,
}

enum ImporterCsvFileEncoding {
    ascii = 'ascii',
    utf8 = 'utf8',
    utf16le = 'utf16le',
    ucs2 = 'ucs2',
    base64 = 'base64',
    latin1 = 'latin1',
    binary = 'binary',
    hex = 'hex',
}

export enum ImporterCardinalityType {
    oneToOne = 'one-to-one',
    oneToMany = 'one-to-many',
    manyToOne = 'many-to-one',
    manyToMany = 'many-to-many',
}

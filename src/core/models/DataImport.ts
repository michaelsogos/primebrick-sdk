import { ImporterDefinition } from './ImporterDescriptor';

export class DataImport {
    definition: ImporterDefinition;
    data: unknown[];
    file: string;
}

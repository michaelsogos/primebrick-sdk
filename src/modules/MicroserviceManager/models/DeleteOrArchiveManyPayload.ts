import { BaseEntityActionPayload } from './BaseEntityActionPayload';

export class DeleteOrArchiveManyPayload extends BaseEntityActionPayload {
    entityIds: number[];
}

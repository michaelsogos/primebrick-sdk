import { BaseEntityActionPayload } from './BaseEntityActionPayload';

export class DeleteOrArchiveOrRestoreManyPayload extends BaseEntityActionPayload {
    entityIds: number[];
}

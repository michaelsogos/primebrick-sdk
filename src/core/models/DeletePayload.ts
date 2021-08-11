import { BaseEntityActionPayload } from './BaseEntityActionPayload';

export class DeletePayload extends BaseEntityActionPayload {
    entityId: number;
    isRecoverable: boolean;
}

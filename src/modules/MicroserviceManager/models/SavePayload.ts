import { BaseEntityActionPayload } from './BaseEntityActionPayload';

export class SavePayload extends BaseEntityActionPayload {
    entity: unknown;
}

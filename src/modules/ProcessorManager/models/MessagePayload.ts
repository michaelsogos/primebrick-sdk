import { SessionContext } from '../../../core/models/SessionContext';

export class MessagePayload<T> {
    context: SessionContext;
    data: T;
}

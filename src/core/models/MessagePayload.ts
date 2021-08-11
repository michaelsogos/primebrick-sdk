import { SessionContext } from './SessionContext';
import { SessionManagerContext } from '../../modules/SessionManager/sessionmanager.context';

export class MessagePayload<T> {
    context: SessionContext;
    data: T;

    static wrap<T>(data: T) {
        const message = new MessagePayload<T>();
        message.context = SessionManagerContext.getInstance().get('context');
        message.data = data;
        return message;
    }
}

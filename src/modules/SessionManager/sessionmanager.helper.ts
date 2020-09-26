import * as asyncHooks from 'async_hooks';
import { SessionManagerStorage } from './sessionmanager.storage';

export class SessionManagerHelper {
    public static createHooks(storage: SessionManagerStorage): asyncHooks.AsyncHook {
        function init(asyncId: number, type: string, triggerId: number, resource: Object) {
            if (storage.has(triggerId)) {
                storage.inherit(asyncId, triggerId);
            }
        }

        function destroy(asyncId: number) {
            storage.delete(asyncId);
        }

        return asyncHooks.createHook({
            init,
            destroy,
        } as asyncHooks.HookCallbacks);
    }
}

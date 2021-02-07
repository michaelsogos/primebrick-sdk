export class SessionManagerException extends Error {
    constructor(executionAsyncId: number) {
        super(`SessionContext execution ID [${executionAsyncId}] is not registered within internal cache.`);

        Object.setPrototypeOf(this, SessionManagerException.prototype);
    }
}

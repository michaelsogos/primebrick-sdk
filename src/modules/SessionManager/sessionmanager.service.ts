import { Injectable } from '@nestjs/common';
// import { ContextId, ContextIdFactory, ModuleRef } from '@nestjs/core';
import { SessionContext } from '../../core/models/SessionContext';
// import * as cls from 'cls-hooked';
// import { AsyncLocalStorage } from 'async_hooks';
import { SessionManagerContext } from './sessionmanager.context';

@Injectable()
export class SessionManagerService {
    constructor(private readonly sessionManagerContext: SessionManagerContext) {}

    // private readonly contextId: ContextId;
    // constructor(private moduleRef: ModuleRef) {
    //     this.contextId = ContextIdFactory.create();
    // }

    // getValue(key: string): any {
    //     const session = cls.getNamespace('session');
    //     return session.get(key);
    // }

    // getContext(): SessionContext {
    //     return this.getValue('context');
    // }

    // async getContext(): Promise<SessionContext> {
    //     const request: Request = await this.moduleRef.resolve(REQUEST, this.contextId, { strict: false });
    //     return request['context'];
    // }

    // getLocalStorage(): AsyncLocalStorage<Map<string, any>> {
    //     return global['als'];
    // }

    getValue(key: string): any {
        return this.sessionManagerContext.get(key);
    }

    getContext(): SessionContext {
        return this.getValue('context');
    }
}

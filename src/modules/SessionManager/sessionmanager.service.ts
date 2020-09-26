import { Injectable } from '@nestjs/common';
// import { ContextId, ContextIdFactory, ModuleRef } from '@nestjs/core';
import { SessionContext } from '../../core/models/SessionContext';
// import * as cls from 'cls-hooked';
import { AsyncLocalStorageContext as Context } from '@northscaler/continuation-local-storage';

@Injectable()
export class SessionManagerService {
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

    getValue(key: string): any {
        return Context().get(key);
    }

    getContext(): SessionContext {
        return this.getValue('context');
    }
}

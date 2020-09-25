import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { SessionContext } from '../../core/models/SessionContext';
// import * as cls from 'cls-hooked';


@Injectable()
export class SessionManagerService {
    constructor(private moduleRef: ModuleRef) {}

    // getValue(key: string): any {
    //     const session = cls.getNamespace('session');
    //     return session.get(key);
    // }

    // getContext(): SessionContext {
    //     return this.getValue('context');
    // }

    async getContext(): Promise<SessionContext> {
        const request: Request = await this.moduleRef.resolve('REQUEST');
        return request['context'];
    }
}

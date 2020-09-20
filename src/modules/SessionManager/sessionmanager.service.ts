import { Injectable } from '@nestjs/common';
import * as cls from 'cls-hooked';
import { SessionContext } from '../../core';

@Injectable()
export class SessionManagerService {
    getValue(key: string): any {
        const session = cls.getNamespace('session');
        return session.get(key);
    }

    getContext(): SessionContext {
        return this.getValue('context');
    }
}

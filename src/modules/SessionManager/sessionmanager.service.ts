import { Injectable } from '@nestjs/common';
import * as cls from 'cls-hooked';
import { ContextPayload } from '../../core';

@Injectable()
export class SessionManagerService {
    private readonly session: cls.Namespace = null;

    constructor() {
        this.session = cls.getNamespace('session');
    }

    getValue(key: string): unknown {
        return this.session.get(key);
    }

    getContext(): ContextPayload {
        return this.session.get('context');
    }
}

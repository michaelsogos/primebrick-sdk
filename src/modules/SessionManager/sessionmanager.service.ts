import { Injectable } from '@nestjs/common';
import { SessionContext } from '../../core/models/SessionContext';
import { SessionManagerContext } from './sessionmanager.context';

@Injectable()
export class SessionManagerService {
    constructor(private readonly sessionManagerContext: SessionManagerContext) {}

    getValue(key: string): any {
        return this.sessionManagerContext.get(key);
    }

    getContext(): SessionContext {
        return this.getValue('context');
    }
}

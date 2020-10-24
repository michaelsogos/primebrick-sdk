import { CommonHelper } from '../../core/utils/CommonHelper';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { SessionManagerContext } from './sessionmanager.context';

@Injectable()
export class SessionManagerMiddleware implements NestMiddleware {
    constructor(private readonly sessionManagerContext: SessionManagerContext) {}

    public use(req: any, res: any, next: () => void) {
        const requestContext = CommonHelper.getContextFromHttpRequest(req);
        this.sessionManagerContext.run(() => {
            this.sessionManagerContext.set('context', requestContext);
            next();
        });
    }
}

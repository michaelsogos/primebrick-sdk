import { Request, Response } from 'express';
import * as cls from 'cls-hooked';
import { CommonHelper } from '../../core/utils/CommonHelper';
import { Injectable, NestMiddleware } from '@nestjs/common';

const session = cls.createNamespace('session');

@Injectable()
export class SessionManagerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: Function) {
        const requestContext = CommonHelper.getContextFromHttpRequest(req);
        const sessionA = cls.getNamespace('session');

        if (!sessionA) throw new Error('CLS Session is not initialized!');
        sessionA.run(() => {
            sessionA.set('context', requestContext);
            next();
        });
    }
}

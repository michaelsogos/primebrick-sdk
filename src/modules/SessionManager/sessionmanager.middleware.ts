import { Request, Response } from 'express';
import * as cls from 'cls-hooked';
import { CommonHelper } from '../../core/utils/CommonHelper';
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
    constructor() {
        cls.createNamespace('session');
    }

    use(req: Request, res: Response, next: Function) {
        const requestContext = CommonHelper.getContextFromHttpRequest(req);
        const session = cls.getNamespace('session');

        if (!session) throw new Error('CLS Session is not initialized!');
        session.run(() => {
            session.set('context', requestContext);
            next();
        });
    }
}

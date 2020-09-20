import { Request, Response } from 'express';
import * as cls from 'cls-hooked';
import { CommonHelper } from '../../core/utils/CommonHelper';

export function sessionManagerMiddleware(req: Request, res: Response, next: Function): void {
    const requestContext = CommonHelper.getContextFromHttpRequest(req);
    const session = cls.createNamespace('session');
    session.run(() => {
        session.set('context', requestContext);
        next();
    });
}

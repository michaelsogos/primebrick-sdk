import { Request, Response } from 'express';
// import * as cls from 'cls-hooked';
import { CommonHelper } from '../../core/utils/CommonHelper';

// const session = cls.createNamespace('session');

export function sessionManagerMiddleware(req: Request, res: Response, next: Function): void {
    const requestContext = CommonHelper.getContextFromHttpRequest(req);
    // const sessionA = cls.getNamespace('session');

    // if (!sessionA) throw new Error('CLS Session is not initialized!');
    // sessionA.run(() => {
    //     sessionA.set('context', requestContext);
    //     next();
    // });

    req['context'] = requestContext;
    next();
}

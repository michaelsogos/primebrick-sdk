import { Request, Response } from 'express';
// import * as cls from 'cls-hooked';
import { CommonHelper } from '../../core/utils/CommonHelper';
import { AsyncLocalStorage } from 'async_hooks';

// const session = cls.createNamespace('session');
global['als'] = new AsyncLocalStorage<Map<string, any>>();

export function sessionManagerMiddleware(req: Request, res: Response, next: Function): void {
    const requestContext = CommonHelper.getContextFromHttpRequest(req);
    // const sessionA = cls.getNamespace('session');

    // if (!sessionA) throw new Error('CLS Session is not initialized!');
    // sessionA.run(() => {
    //     sessionA.set('context', requestContext);
    //     next();
    // });

    // req['context'] = requestContext;

    global['als'].run(new Map(), () => {
        global['als'].getStore().set('context', requestContext);
        next();
    });

    next();
}

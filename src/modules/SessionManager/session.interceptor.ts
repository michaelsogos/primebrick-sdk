import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as cls from 'cls-hooked';
import { CommonHelper } from '../../core/utils/CommonHelper';

@Injectable()
export class SessionInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const requestContext = CommonHelper.getRequestContext(context);
        const session = cls.createNamespace('session');
        session.set('context', requestContext);

        return next.handle().pipe(tap(() => cls.destroyNamespace('session')));
    }
}

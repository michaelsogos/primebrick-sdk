import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CommonHelper } from '../../core/utils/CommonHelper';
import { SessionManagerContext } from './sessionmanager.context';

@Injectable()
export class SessionManagerInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const requestContext = CommonHelper.getContextFromExecutionContext(context);
        const sessionManagerContext = SessionManagerContext.getInstance();
        let goNext = null;
        sessionManagerContext.run(() => {
            sessionManagerContext.set('context', requestContext);
            goNext = next.handle();
        });

        return goNext;
    }
}

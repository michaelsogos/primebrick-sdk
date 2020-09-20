import { RequestInterceptor, RequestStorage } from '@nest-kr/request-storage';
import { CommonHelper } from '../../core/utils/CommonHelper';

export class SessionManagerInterceptor implements RequestInterceptor {
    intercept(req: any, requestStorage: RequestStorage): void {
        const requestContext = CommonHelper.getContextFromHttpRequest(req);
        requestStorage.set('context', requestContext);
    }
}

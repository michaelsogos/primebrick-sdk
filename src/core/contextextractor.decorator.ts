import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantManagerHelper } from '../modules/TenantManager/utils/TenantManagerHelper';
import { AuthManagerHelper } from '../modules/AuthManager/utils/AuthManagerHelper';
import { CommonHelper } from './utils/CommonHelper';
import { SessionContext } from './models/SessionContext';

export const Context = createParamDecorator((data: any, context: ExecutionContext) => {
    const result = new SessionContext();
    result.tenantAlias = TenantManagerHelper.getTenantAliasFromExecutionContext(context);
    result.userProfile = AuthManagerHelper.getUserProfileFromExecutionContext(context);
    result.languageCode = CommonHelper.getLanguageCodeFromExecutionContext(context, result.userProfile);
    return result;
});

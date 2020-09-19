import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantManagerHelper } from '../modules/TenantManager/utils/TenantManagerHelper';
import { ContextPayload } from './models/ContextPayload';
import { AuthManagerHelper } from '../modules/AuthManager/utils/AuthManagerHelper';
import { CommonHelper } from './utils/CommonHelper';

export const Context = createParamDecorator((data: { excludeUserProfile?: boolean }, ctx: ExecutionContext) => {
    //TODO: @michaelsogos -> Change internal logic to call standard method in CommonHelper.getRequestContext() and remove the "exludedUserProfile" variable
    const result = new ContextPayload();
    result.tenantAlias = TenantManagerHelper.getTenantAliasFromContext(ctx);
    result.userProfile = data && data.excludeUserProfile ? null : AuthManagerHelper.getUserProfile(ctx);
    result.languageCode = CommonHelper.getLanguageCode(ctx, result.userProfile);
    return result;
});

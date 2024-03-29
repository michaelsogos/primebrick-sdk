import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantManagerHelper } from '../../modules/TenantManager/utils/TenantManagerHelper';

export const Tenant = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    return TenantManagerHelper.getTenantAliasFromExecutionContext(ctx);
});

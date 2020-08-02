import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { TenantManagerHelper } from "./utils/TenantManagerHelper";

export const Tenant = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	return TenantManagerHelper.getTenantAliasFromContext(ctx);
});

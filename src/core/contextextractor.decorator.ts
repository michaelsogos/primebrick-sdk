import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { TenantManagerHelper } from "../modules/TenantManager/utils/TenantManagerHelper";
import { ContextPayload } from "./models/ContextPayload";
import { AuthManagerHelper } from "../modules/AuthManager/utils/AuthManagerHelper";

export const Context = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
	const result = new ContextPayload();
	result.tenantAlias = TenantManagerHelper.getTenantAliasFromContext(ctx);
	result.userProfile = AuthManagerHelper.getUserProfile(ctx);
	return result;
});

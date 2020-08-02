import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { TenantManagerHelper } from "../TenantManager/utils/TenantManagerHelper";
import { LocalStrategyHelper } from "./utils/LocalStrategyHelper";
import { OAuth2StrategyHelper } from "./utils/OAuth2StrategyHelper";
import { Saml2StrategyHelper } from "./utils/Saml2StrategyHelper";

@Injectable()
export class AuthGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
		const tenantAlias = TenantManagerHelper.getTenantAliasFromContext(context);
		const tenantAuthConfig = TenantManagerHelper.getTenantConfigByAlias(tenantAlias).tenant_auth_config;

		switch (tenantAuthConfig.auth_type) {
			case "local":
				return LocalStrategyHelper.validateRequest(tenantAuthConfig, LocalStrategyHelper.getBearerToken(context));
			case "oauth2":
				return OAuth2StrategyHelper.validateRequest(tenantAuthConfig);
			case "saml2":
				return Saml2StrategyHelper.validateRequest(tenantAuthConfig);
		}
	}
}

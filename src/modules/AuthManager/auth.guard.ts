import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantManagerHelper } from '../TenantManager/utils/TenantManagerHelper';
import { LocalStrategyHelper } from './utils/LocalStrategyHelper';
import { OAuth2StrategyHelper } from './utils/OAuth2StrategyHelper';
import { Saml2StrategyHelper } from './utils/Saml2StrategyHelper';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const tenantAlias = TenantManagerHelper.getTenantAliasFromExecutionContext(context);
        const tenant = TenantManagerHelper.getTenantConfigByAlias(tenantAlias);

        if (!tenant) throw new Error('The request cannot be authorized because is impossible to identify target tenant!');

        switch (tenant.tenant_auth_config.auth_type) {
            case 'local':
                return LocalStrategyHelper.validateRequestFromExecutionContext(context, tenant);
            case 'oauth2':
                return OAuth2StrategyHelper.validateRequest(tenant);
            case 'saml2':
                return Saml2StrategyHelper.validateRequest(tenant);
        }
    }
}

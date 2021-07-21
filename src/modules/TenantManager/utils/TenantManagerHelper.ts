import { Tenant } from '../entities/Tenant.entity';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export class TenantManagerHelper {
    static getTenantConfigByAlias(alias: string): Tenant {
        if (!alias) throw new Error('Cannot get tenant config from empty or invalid tenant alias!');
        if (!global['tenants'] || global['tenants'].length <= 0) throw new Error("There aren't tenants configured on system!");

        let config: Tenant = null;
        for (const tenant of global['tenants'] as Tenant[]) {
            for (const tenantAlias of tenant.tenant_aliases) {
                if (tenantAlias.alias == alias) {
                    config = tenant;
                    break;
                }
            }

            if (config) break;
        }

        return config;
    }

    static getTenantAliasFromExecutionContext(context: ExecutionContext): string {
        switch (context.getType()) {
            case 'http':
                return this.getTenantAliasFromHttpRequest(context.switchToHttp().getRequest());
            case 'rpc':
                return context.switchToRpc().getData()['tenantAlias'];
            case 'ws':
                throw new Error('Not implemented yet!');
        }
    }

    static getTenantAliasFromHttpRequest(request: Request) {
        const headerTenantAlias = request.header('x-tenant');
        if (headerTenantAlias) return headerTenantAlias;
        else return request.hostname;
    }
}

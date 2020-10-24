import { Tenant } from '../entities/Tenant.entity';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export class TenantManagerHelper {
    static getTenantConfigByAlias(alias: string): Tenant {
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
        return request['tenantAlias'];
    }

    static getTenantAliasFromRpcRequest(request: any) {
        return request['tenantAlias'];
    }
}

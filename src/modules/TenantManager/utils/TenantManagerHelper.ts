import { TenantConfig } from '../entities/TenantConfig.entity';

export class TenantManagerHelper {
  static getTenantConfigByAlias(alias: string): TenantConfig {
    let config: TenantConfig = null;
    for (const tenantConfig of global['tenants'] as TenantConfig[]) {
      for (const tenantAlias of tenantConfig.tenant_alias) {
        if (tenantAlias.alias == alias) {
          config = tenantConfig;
          break;
        }
      }

      if (config) break;
    }

    return config;
  }
}

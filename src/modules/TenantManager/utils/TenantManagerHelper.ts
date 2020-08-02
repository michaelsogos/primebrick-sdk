import { Tenant } from "../entities/Tenant.entity";

export class TenantManagerHelper {
	static getTenantConfigByAlias(alias: string): Tenant {
		let config: Tenant = null;
		for (const tenant of global["tenants"] as Tenant[]) {
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
}

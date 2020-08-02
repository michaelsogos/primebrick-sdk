import { Tenant } from "../entities/Tenant.entity";
import { ExecutionContext } from "@nestjs/common";

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

	static getTenantAliasFromContext(context: ExecutionContext): string {
		switch (context.getType()) {
			case "http":
				return context.switchToHttp().getRequest()["tenantAlias"];
			case "rpc":
				return context.switchToRpc().getData()["tenantAlias"];
			case "ws":
				throw new Error("Not implemented yet!");
		}
	}
}

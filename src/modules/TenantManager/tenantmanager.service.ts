import { Injectable } from "@nestjs/common";
import { Tenant } from "./entities/Tenant.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TenantManagerHelper } from "./utils/TenantManagerHelper";
import { TenantThemeConfig } from "./entities/TenantThemeConfig.entity";

@Injectable()
export class TenantManagerService {
	constructor(
		@InjectRepository(Tenant, "primebrick_coordinator")
		private tenantManagerRepository: Repository<Tenant>,
		private themeManagerRepository: Repository<TenantThemeConfig>
	) {}

	async getAllTenants(): Promise<Tenant[]> {
		const tenantConfigs = await this.tenantManagerRepository.find({
			relations: ["tenant_aliases", "tenant_db_config", "tenant_auth_config"],
		});
		return tenantConfigs;
	}

	async loadAllTenantsInMemory(force: boolean): Promise<void> {
		if (global["tenants"] == null || force) {
			const tenants = await this.getAllTenants();
			global["tenants"] = tenants;
		}
	}

	getTenantConfig(tenantAlias: string): Tenant {
		return TenantManagerHelper.getTenantConfigByAlias(tenantAlias);
	}

	async getTenantTheme(tenant: Tenant): Promise<TenantThemeConfig> {
		const tenantTheme = await this.themeManagerRepository.findOneOrFail(null, {
			where: { tenant: tenant },
		});

		return tenantTheme;
	}
}

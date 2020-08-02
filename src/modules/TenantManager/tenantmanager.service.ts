import { Injectable } from "@nestjs/common";
import { Tenant } from "./entities/Tenant.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class TenantManagerService {
	constructor(
		@InjectRepository(Tenant, "primebrick_coordinator")
		private tenantManagerRepository: Repository<Tenant>
	) {}

	async getAllTenants(): Promise<Tenant[]> {
		const tenantConfigs = await this.tenantManagerRepository.find({
			relations: ["tenant_alias"],
		});
		return tenantConfigs;
	}

	async loadAllTenantsInMemory(force: boolean): Promise<void> {
		if (global["tenants"] == null || force) {
			const tenants = await this.getAllTenants();
			global["tenants"] = tenants;
		}
	}
}

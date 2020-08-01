import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { TenantManagerService } from "../modules/TenantManager/tenantmanager.service";

@Injectable()
export class PrimeBrickModule implements OnApplicationBootstrap {
	constructor(readonly tenantManagerService: TenantManagerService) {}

	async onApplicationBootstrap(): Promise<void> {
		await this.tenantManagerService.loadAllTenantsInMemory(true);
	}
}

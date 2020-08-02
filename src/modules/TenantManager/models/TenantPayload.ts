import { Tenant } from "../entities/Tenant.entity";

export class TenantPayload {
	alias: string;
	config: Tenant;
}

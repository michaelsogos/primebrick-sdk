import { NotImplementedException } from "@nestjs/common";
import { Tenant } from "../../TenantManager/entities/Tenant.entity";

export class Saml2StrategyHelper {
	static validateRequest(tenantConfig: Tenant): boolean {
		throw new NotImplementedException();
	}
}

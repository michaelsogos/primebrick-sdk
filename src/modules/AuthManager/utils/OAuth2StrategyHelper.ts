import { NotImplementedException } from "@nestjs/common";
import { User } from "../entities/User.entity";
import { Tenant } from "../../TenantManager/entities/Tenant.entity";

export class OAuth2StrategyHelper {
	static validateRequest(tenantConfig: Tenant): boolean {
		throw new NotImplementedException();
	}

	static async authenticate(): Promise<User> {
		throw new NotImplementedException();
	}
}

import { TenantAuthConfig } from "../../TenantManager/entities/TenantAUTHConfig.entity";
import { NotImplementedException } from "@nestjs/common";
import { User } from "../entities/User.entity";

export class Saml2StrategyHelper {
	static validateRequest(config: TenantAuthConfig): boolean {
		throw new NotImplementedException();
	}

	static async authenticate(): Promise<User> {
		throw new NotImplementedException();
	}
}

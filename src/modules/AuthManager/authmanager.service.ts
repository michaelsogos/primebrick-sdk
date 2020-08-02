import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Brackets } from "typeorm";
import jwt from "jsonwebtoken";
import { TenantManagerHelper } from "../TenantManager/utils/TenantManagerHelper";
import { LocalStrategyHelper } from "./utils/LocalStrategyHelper";
import { TenantRepositoryService } from "../TenantManager/tenantrepository.service";
import { Login } from "./entities/Login.entity";
import { User } from "./entities/User.entity";
import { LocalAuthConfig } from "./models/LocalAuthConfig";
import { OAuth2StrategyHelper } from "./utils/OAuth2StrategyHelper";
import { Saml2StrategyHelper } from "./utils/Saml2StrategyHelper";

@Injectable()
export class AuthManagerService {
	constructor(private readonly repositoryService: TenantRepositoryService) {}

	async login(tenantAlias: string, credentials: { username: string; password: string }): Promise<string> {
		const tenantAuthConfig = TenantManagerHelper.getTenantConfigByAlias(tenantAlias).tenant_auth_config;
		const authConfig: LocalAuthConfig = tenantAuthConfig.auth_config;

		let user: User = null;
		switch (tenantAuthConfig.auth_type) {
			case "local":
				{
					const loginRepository = await this.repositoryService.getTenantRepository(tenantAlias, Login);
					user = await LocalStrategyHelper.authenticate(loginRepository, credentials);
				}
				break;
			case "oauth2":
				user = await OAuth2StrategyHelper.authenticate();
				break;
			case "saml2":
				break;
				user = await Saml2StrategyHelper.authenticate();
		}

		const token = jwt.sign(user, authConfig.secretKey, { audience: [tenantAlias], issuer: "primebrick" });
		return token;
	}
}

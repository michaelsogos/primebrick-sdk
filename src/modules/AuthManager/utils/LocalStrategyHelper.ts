import { TenantAuthConfig } from "../../TenantManager/entities/TenantAUTHConfig.entity";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import jwt from "jsonwebtoken";
import { LocalAuthConfig } from "../models/LocalAuthConfig";
import { TenantRepositoryService } from "../../TenantManager/tenantrepository.service";
import { Tenant } from "../../TenantManager/entities/Tenant.entity";
import { Repository } from "typeorm";
import { Login } from "../entities/Login.entity";
import { User } from "../entities/User.entity";

export class LocalStrategyHelper {
	static validateRequest(config: TenantAuthConfig, token: string): boolean {
		const authConfig: LocalAuthConfig = config.auth_config;
		const decodedToken = jwt.verify(token, authConfig.secretKey, { issuer: "primebrick", audience: `tenant:${config.tenant.code}` });
		return true;
	}

	static getBearerToken(context: ExecutionContext): string {
		switch (context.getType()) {
			case "http": {
				const req = context.switchToHttp().getRequest() as Request;

				const authHeader = req.get("Authorization");
				if (!authHeader) throw new UnauthorizedException();

				const token = authHeader.split(" ")[1];
				if (!token) throw new UnauthorizedException();

				return token;
			}
			default:
				throw new UnauthorizedException();
		}
	}

	static async authenticate(loginRepository: Repository<Login>, credentials: { username: string; password: string }): Promise<User> {
		const validLogin = await loginRepository.findOneOrFail(null, { where: { username: credentials.username, password: credentials.password } });
		return validLogin.user;
	}
}

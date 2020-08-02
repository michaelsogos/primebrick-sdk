import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import * as jwt from "jsonwebtoken";
import { LocalAuthConfig } from "../models/LocalAuthConfig";
import { Tenant } from "../../TenantManager/entities/Tenant.entity";

export class LocalStrategyHelper {
	static validateRequest(tenantConfig: Tenant, token: string): boolean {
		const authConfig: LocalAuthConfig = tenantConfig.tenant_auth_config.auth_config;
		const decodedToken = jwt.verify(token, authConfig.secretKey, { issuer: "primebrick", audience: `tenant:${tenantConfig.code}` });
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
}

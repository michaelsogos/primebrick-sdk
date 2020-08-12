import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import * as jwt from "jsonwebtoken";
import { LocalAuthConfig } from "../models/LocalAuthConfig";
import { Tenant } from "../../TenantManager/entities/Tenant.entity";

export class LocalStrategyHelper {
	static validateRequest(tenantConfig: Tenant, token: string): boolean {
		const authConfig: LocalAuthConfig = tenantConfig.tenant_auth_config.auth_config;
		try {
			const decodedToken = jwt.verify(token, authConfig.secretKey, { issuer: "primebrick", audience: `tenant:${tenantConfig.code}` });
			return true;
		} catch (ex) {
			throw new UnauthorizedException("Authorization token is not valid!");
		}
	}

	static getBearerToken(context: ExecutionContext): string {
		switch (context.getType()) {
			case "http": {
				const req = context.switchToHttp().getRequest() as Request;

				const authHeader = req.get("Authorization");
				if (!authHeader) throw new UnauthorizedException("Authorization header missing!");

				const token = authHeader.split(" ")[1];
				if (!token) throw new UnauthorizedException("Authorization bearer token malformed!");

				return token;
			}
			default:
				throw new UnauthorizedException("Only HTTP HEADER bearer authorization token is supported!");
		}
	}

	static getUserProfile(context: ExecutionContext) {
		const token = this.getBearerToken(context);
		const userProfile = jwt.decode(token);
		return userProfile;
	}
}

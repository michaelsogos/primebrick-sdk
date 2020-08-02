import { Controller, Get, Post, Body } from "@nestjs/common";
import { AuthManagerService } from "./authmanager.service";
import { Tenant } from "../TenantManager/tenantextractor.decorator";

@Controller("api/auth")
export class AuthManagerController {
	constructor(private readonly authManagerService: AuthManagerService) {}

	@Post("login")
	async login(@Tenant() tenantAlias: string, @Body() credentials: { username: string; password: string }): Promise<void> {
		await this.authManagerService.login(tenantAlias, credentials);
	}
}

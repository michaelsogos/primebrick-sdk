import { Module } from "@nestjs/common";
import { TenantManagerModule } from "../TenantManager/tenantmanager.module";
import { AuthManagerService } from "./authmanager.service";
import { AuthManagerController } from "./authmanager.controller";

@Module({
	imports: [TenantManagerModule],
	controllers: [AuthManagerController],
	providers: [AuthManagerService],
	exports: [],
})
export class AuthManagerModule {}

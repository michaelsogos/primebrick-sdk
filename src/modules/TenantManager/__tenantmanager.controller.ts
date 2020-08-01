import { Controller, Get } from '@nestjs/common';
import { TenantConfig } from './entities/TenantConfig.entity';
import { TenantManagerService } from './tenantmanager.service';

@Controller('api/tenant')
export class TenantManagerController {
  constructor(private readonly tenantManagerService: TenantManagerService) {}

  @Get()
  async getAllTenants(): Promise<TenantConfig[]> {
    const tenants: TenantConfig[] = await this.tenantManagerService.getAllTenants();
    return tenants;
  }
}

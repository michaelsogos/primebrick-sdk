import { Injectable } from '@nestjs/common';
import { TenantConfig } from './entities/TenantConfig.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TenantManagerService {
  constructor(
    @InjectRepository(TenantConfig, 'primebrick_coordinator')
    private tenantManagerRepository: Repository<TenantConfig>,
  ) {}

  async getAllTenants(): Promise<TenantConfig[]> {
    const tenantConfigs = await this.tenantManagerRepository.find({
      relations: ['tenant_alias'],
    });
    return tenantConfigs;
  }

  async loadAllTenantsInMemory(force: boolean): Promise<void> {
    if (global['tenants'] == null || force) {
      const tenants = await this.getAllTenants();
      global['tenants'] = tenants;
    }
  }
}

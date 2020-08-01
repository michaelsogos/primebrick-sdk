import { TenantConfig } from '../entities/TenantConfig.entity';

export class TenantPayload {
  alias: string;
  config: TenantConfig;
}

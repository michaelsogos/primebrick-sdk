import { Injectable } from '@nestjs/common';
import { AdvancedLogger } from '../../core/logger.service';
import { Tenant } from '../TenantManager/entities/Tenant.entity';
import { UserProfile } from './models/UserProfile';
import { AuthManagerHelper } from './utils/AuthManagerHelper';
import { LocalStrategyHelper } from './utils/LocalStrategyHelper';

@Injectable()
export class LocalAuthManagerService {
    constructor(private readonly logger: AdvancedLogger) {
        logger.setContext(LocalAuthManagerService.name);
    }

    async createAuthenticationToken(tenantConfig: Tenant, userProfile: UserProfile) {
        const result = LocalStrategyHelper.createAuthenticationToken(tenantConfig, userProfile);
        return result;
    }

    async verifyAuthenticationToken(token: string, tenantConfig: Tenant, ignoreExpiration: boolean = false) {
        const result = LocalStrategyHelper.verifyAuthenticationToken(token, tenantConfig, ignoreExpiration);
        return result;
    }

    async verifyPassword(hashedPassword: string, plainPassword: string) {
        const securePassword = AuthManagerHelper.secureStringReader(hashedPassword);
        const secureString = AuthManagerHelper.buildSecureString(plainPassword, securePassword.salt, securePassword.iterations);

        return secureString == hashedPassword;
    }
}

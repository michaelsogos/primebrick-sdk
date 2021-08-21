import { Injectable } from '@nestjs/common';
import { Tenant } from '../TenantManager/entities/Tenant.entity';
import { AuthTokenPayload } from '../../core/models/AuthTokenPayload';
import { UserProfile } from '../../core/models/UserProfile';
import { AuthManagerHelper } from './utils/AuthManagerHelper';
import { LocalStrategyHelper } from './utils/LocalStrategyHelper';
import { LogManagerService } from '../LogManager/logmanager.service';

@Injectable()
export class LocalAuthManagerService {
    constructor(private readonly logger: LogManagerService) {}

    async createAuthenticationToken(tenantConfig: Tenant, userProfile: UserProfile): Promise<AuthTokenPayload> {
        const result = LocalStrategyHelper.createAuthenticationToken(tenantConfig, userProfile);
        return result;
    }

    async verifyAuthenticationToken(token: string, tenantConfig: Tenant, ignoreExpiration: boolean = false): Promise<string | object> {
        const result = LocalStrategyHelper.verifyAuthenticationToken(token, tenantConfig, ignoreExpiration);
        return result;
    }

    async verifyPassword(hashedPassword: string, plainPassword: string): Promise<boolean> {
        const securePassword = AuthManagerHelper.secureStringReader(hashedPassword);
        const secureString = AuthManagerHelper.buildSecureString(plainPassword, securePassword.salt, securePassword.iterations);

        return secureString == hashedPassword;
    }
}

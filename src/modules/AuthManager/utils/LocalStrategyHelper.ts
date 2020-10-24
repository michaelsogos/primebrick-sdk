import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { LocalAuthConfig } from '../models/LocalAuthConfig';
import { Tenant } from '../../TenantManager/entities/Tenant.entity';
import { UserProfile } from '../models/UserProfile';

export class LocalStrategyHelper {
    static validateRequest(tenantConfig: Tenant, token: string): boolean {
        const authConfig: LocalAuthConfig = tenantConfig.tenant_auth_config.auth_config;
        try {
            const decodedToken = jwt.verify(token, authConfig.secretKey, { issuer: 'primebrick', audience: `tenant:${tenantConfig.code}` });
            return true;
        } catch (ex) {
            throw new UnauthorizedException('Authorization token is not valid!');
        }
    }

    static validateRequestFromExecutionContext(context: ExecutionContext, tenantConfig: Tenant) {
        switch (context.getType()) {
            case 'http':
                return this.validateRequest(tenantConfig, this.getBearerToken(context.switchToHttp().getRequest()));
            case 'rpc':
                throw new Error('Not implemented yet!');
            case 'ws':
                throw new Error('Not implemented yet!');
        }
    }

    static getBearerToken(request: Request): string {
        const authHeader = request.get('Authorization');
        if (!authHeader) throw new UnauthorizedException('Authorization header missing!');

        const token = authHeader.split(' ')[1];
        if (!token) throw new UnauthorizedException('Authorization bearer token malformed!');

        return token;
    }

    static getUserProfileFromExecutionContext(context: ExecutionContext): UserProfile {
        switch (context.getType()) {
            case 'http':
                return LocalStrategyHelper.getUserProfileFromHttpRequest(context.switchToHttp().getRequest());
            case 'rpc':
                return LocalStrategyHelper.getUserProfileFromRpcRequest(context.switchToRpc().getContext());
            case 'ws':
                throw new Error('Not implemented yet!');
        }
    }

    static getUserProfileFromHttpRequest(request: Request) {
        const token = this.getBearerToken(request);
        const userProfile = jwt.decode(token) as UserProfile;
        return userProfile;
    }

    static getUserProfileFromRpcRequest(request: any): UserProfile {
        return request['userProfile'];
    }
}

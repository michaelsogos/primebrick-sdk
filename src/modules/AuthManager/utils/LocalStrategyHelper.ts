import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { LocalAuthConfig } from '../models/LocalAuthConfig';
import { Tenant } from '../../TenantManager/entities/Tenant.entity';
import { UserProfile } from '../models/UserProfile';
import { MessagePayload } from '../../ProcessorManager/models/MessagePayload';
import { AuthTokenPayload } from '../models/AuthTokenPayload';

export class LocalStrategyHelper {
    static validateRequest(tenantConfig: Tenant, token: string): boolean {
        const authConfig: LocalAuthConfig = tenantConfig.tenant_auth_config.auth_config;
        try {
            const decodedToken = LocalStrategyHelper.verifyAuthenticationToken(token, tenantConfig);
            // jwt.verify(token, authConfig.secretKey, { issuer: 'primebrick', audience: `tenant:${tenantConfig.code}` });
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
                return LocalStrategyHelper.getUserProfileFromRpcRequest(context.switchToRpc().getData());
            case 'ws':
                throw new Error('Not implemented yet!');
        }
    }

    static getUserProfileFromHttpRequest(request: Request) {
        const token = this.getBearerToken(request);
        const userProfile = jwt.decode(token) as UserProfile;
        return userProfile;
    }

    static getUserProfileFromRpcRequest(request: MessagePayload<any>): UserProfile {
        return request.context.userProfile;
    }

    static createAuthenticationToken(tenantConfig: Tenant, userProfile: UserProfile) {
        try {
            const authConfig: LocalAuthConfig = tenantConfig.tenant_auth_config.auth_config;

            const access_token = jwt.sign(Object.assign({}, userProfile), authConfig.secretKey, {
                audience: [`tenant:${tenantConfig.code}`],
                issuer: 'primebrick',
                expiresIn: authConfig.tokenExpiresIn || '15m',
            });

            const refresh_token = jwt.sign({}, authConfig.secretKey, {
                audience: [`tenant:${tenantConfig.code}`],
                issuer: 'primebrick',
                expiresIn: authConfig.sessionExpiresIn || '1d',
            });

            const access_token_payload = jwt.decode(access_token);

            const payload = new AuthTokenPayload();
            payload.access_token = access_token;
            payload.refresh_token = refresh_token;
            payload.token_type = 'Bearer';
            payload.expires_in = (access_token_payload['exp'] as number) - (access_token_payload['iat'] as number);

            return payload;
        } catch (ex) {
            throw new UnauthorizedException('Credentials are invalid!');
        }
    }

    static verifyAuthenticationToken(token: string, tenantConfig: Tenant, ignoreExpiration: boolean = false) {
        const authConfig: LocalAuthConfig = tenantConfig.tenant_auth_config.auth_config;

        const decodedAccessToken = jwt.verify(token, authConfig.secretKey, {
            issuer: 'primebrick',
            audience: `tenant:${tenantConfig.code}`,
            ignoreExpiration: ignoreExpiration,
        });

        return decodedAccessToken;
    }
    
}

import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { LocalAuthConfig } from '../models/LocalAuthConfig';
import { Tenant } from '../../TenantManager/entities/Tenant.entity';
import { UserProfile } from '../../../core/models/UserProfile';
import { AuthTokenPayload } from '../../../core/models/AuthTokenPayload';
import { AuthManagerHelper } from './AuthManagerHelper';

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

    static validateRequestFromExecutionContext(context: ExecutionContext, tenantConfig: Tenant): boolean {
        switch (context.getType()) {
            case 'http':
                return this.validateRequest(tenantConfig, this.getBearerToken(context.switchToHttp().getRequest()));
            case 'rpc':
                //TODO: @mso -> This check eventually consistent logged in user
                //Cause it is a lazy check it can be unsecure, at the same time a chain of microservices running long process
                //can land on race condition where the user token can expire, in that case a microservice should not auto refresh the token
                //but at the same time a long running process cannot stop work because the token expired
                //For this reason we have a lazy check that is enought to ensure that at the time user call an RPC action its token was valid
                //This allow developers to make SECURE CONTROLLER on microservice which need a user to be logged
                //usually because user profile can be used to add kind of security check accessing data (ROLE PERMISSION, FIELD PERMISSION, etc.)
                //This comment is to keep track of this choise and in case implement in future a better and more secure approach
                return AuthManagerHelper.getUserProfileFromRpcRequest(context.switchToRpc().getData()) ? true : false;
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

    static getUserProfileFromHttpRequest(request: Request) {
        const token = this.getBearerToken(request);
        const userProfile = jwt.decode(token) as UserProfile;
        return userProfile;
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

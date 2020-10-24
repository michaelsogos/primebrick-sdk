import { Injectable, Inject } from '@nestjs/common';
import { MessagePayload } from './models/MessagePayload';
import { ClientProxy } from '@nestjs/microservices';
import { Tenant } from '../TenantManager/entities/Tenant.entity';
import { SessionManagerContext } from '../SessionManager/sessionmanager.context';
import { SessionContext } from '../../core';
import { TenantManagerHelper } from '../TenantManager/utils/TenantManagerHelper';

@Injectable()
export class ProcessorManagerService {
    constructor(@Inject('PRIMEBRICK_SERVICE') private busClient: ClientProxy, private readonly sessionManagerContext: SessionManagerContext) {}

    private prepareMessage<T>(payload: T, context: SessionContext): MessagePayload<T> {
        const messagePayload = new MessagePayload<T>();
        messagePayload.data = payload;
        messagePayload.context = context;

        return messagePayload;
    }

    async sendMessage<T>(actionName: string, payload: T, timeout = 30000): Promise<any> {
        let tenantAlias: string = null;
        try {
            const context: SessionContext = this.sessionManagerContext.get('context');
            tenantAlias = context.tenantAlias;
        } catch (ex) {
            throw new Error(
                'ProcessorManagerService.sendMessage() can be used only within an execution context [http request, microservice message, etc.]!',
            );
        }

        const tenant: Tenant = TenantManagerHelper.getTenantConfigByAlias(tenantAlias);

        if (!tenant) throw new Error(`No tenant aliases found for "${tenantAlias}"!`);

        return await this.sendMessageWithTenant<T>(tenant, actionName, payload, timeout, this.sessionManagerContext.get('context'));
    }

    async sendMessageWithTenant<T>(tenant: Tenant, actionName: string, payload: T, timeout = 30000, sessionContext?: SessionContext) {
        let context = sessionContext;
        if (!context) {
            context = new SessionContext();
            context.languageCode = 'en';
            context.tenantAlias = tenant.tenant_aliases[0].alias;
            context.userProfile = null;
        }

        const respose = await Promise.race([
            this.busClient.send(actionName, this.prepareMessage<T>(payload, context)).toPromise<MessagePayload<any>>(),

            new Promise<MessagePayload<any>>((res, rej) => {
                setTimeout(() => {
                    rej(new Error(`The processor ${actionName} timed out!`));
                }, timeout); // 30 second timeout
            }),
        ]);

        return respose;
    }
}

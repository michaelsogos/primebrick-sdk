import { Injectable, Inject } from '@nestjs/common';
import { MessagePayload } from './models/MessagePayload';
import { ClientProxy } from '@nestjs/microservices';
import { Tenant } from '../TenantManager/entities/Tenant.entity';
import { SessionManagerContext } from '../SessionManager/sessionmanager.context';
import { SessionContext } from '../../core';

@Injectable()
export class ProcessorManagerService {
    constructor(@Inject('PRIMEBRICK_SERVICE') private busClient: ClientProxy /* private readonly sessionManagerContext: SessionManagerContext */) {}

    async sendMessage<T>(actionName: string, payload: T, timeout = 30000): Promise<MessagePayload<any>> {
        let context: SessionContext = null;

        try {
            const sessionManagerContext = SessionManagerContext.getInstance();
            context = sessionManagerContext.get('context');
        } catch (ex) {
            throw new Error(
                'ProcessorManagerService.sendMessage() can be used only within an execution context [http request, microservice message, etc.]!',
            );
        }

        return await this.callMicroservice<T>(actionName, payload, timeout, context);
    }

    async sendMessageWithTenant<T>(tenant: Tenant, actionName: string, payload: T, timeout = 30000): Promise<MessagePayload<any>> {
        const context = new SessionContext();
        context.languageCode = 'en';
        context.tenantAlias = tenant.tenant_aliases[0].alias;
        context.userProfile = null;
        return await this.callMicroservice<T>(actionName, payload, timeout, context);
    }

    private async callMicroservice<T>(actionName: string, payload: T, timeout: number, context: SessionContext): Promise<MessagePayload<any>> {
        const respose = await Promise.race([
            this.busClient.send(actionName, this.prepareMessage<T>(payload, context)).toPromise<MessagePayload<any>>(),

            new Promise<MessagePayload<any>>((res, rej) => {
                setTimeout(() => {
                    rej(new Error(`The execution of microservice action [${actionName}] timed out!`));
                }, timeout); // 30 second timeout
            }),
        ]);

        return respose;
    }

    private prepareMessage<T>(payload: T, context: SessionContext): MessagePayload<T> {
        const messagePayload = new MessagePayload<T>();
        messagePayload.data = payload;
        messagePayload.context = context;

        return messagePayload;
    }
}

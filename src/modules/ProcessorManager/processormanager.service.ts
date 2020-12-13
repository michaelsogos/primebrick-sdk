import { Injectable, Inject } from '@nestjs/common';
import { MessagePayload } from './models/MessagePayload';
import { ClientProxy } from '@nestjs/microservices';
import { Tenant } from '../TenantManager/entities/Tenant.entity';
import { SessionManagerContext } from '../SessionManager/sessionmanager.context';
import { SessionContext } from '../../core';

@Injectable()
export class ProcessorManagerService {
    constructor(@Inject('PRIMEBRICK_SERVICE') private busClient: ClientProxy /* private readonly sessionManagerContext: SessionManagerContext */) {}

    async sendMessage<TPayload, TResult>(actionName: string, payload: TPayload, timeout = 30000): Promise<MessagePayload<TResult>> {
        let context: SessionContext = null;

        try {
            const sessionManagerContext = SessionManagerContext.getInstance();
            context = sessionManagerContext.get('context');
        } catch (ex) {
            throw new Error(
                'ProcessorManagerService.sendMessage() can be used only within an execution context [http request, microservice message, etc.]!',
            );
        }

        return await this.callMicroservice<TPayload, TResult>(actionName, payload, timeout, context);
    }

    async sendMessageWithTenant<TPayload, TResult>(
        tenant: Tenant,
        actionName: string,
        payload: TPayload,
        timeout = 30000,
    ): Promise<MessagePayload<TResult>> {
        const context = new SessionContext();
        context.languageCode = 'en';
        context.tenantAlias = tenant.tenant_aliases[0].alias;
        context.userProfile = null;
        return await this.callMicroservice<TPayload, TResult>(actionName, payload, timeout, context);
    }

    private async callMicroservice<TPayload, TResult>(
        actionName: string,
        payload: TPayload,
        timeout: number,
        context: SessionContext,
    ): Promise<MessagePayload<TResult>> {
        let connectionTimeout: NodeJS.Timeout = null;
        const respose = await Promise.race([
            this.busClient.send(actionName, this.prepareMessage<TPayload>(payload, context)).toPromise<MessagePayload<TResult>>(),

            new Promise<MessagePayload<TResult>>((res, rej) => {
                connectionTimeout = setTimeout(() => {
                    rej(new Error(`The execution of microservice action [${actionName}] timed out after ${timeout}ms!`));
                }, timeout); // 30 second timeout
            }),
        ]);

        clearTimeout(connectionTimeout);
        return respose;
    }

    private prepareMessage<T>(payload: T, context: SessionContext): MessagePayload<T> {
        const messagePayload = new MessagePayload<T>();
        messagePayload.data = payload;
        messagePayload.context = context;

        return messagePayload;
    }
}

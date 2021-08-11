import { Injectable, Inject } from '@nestjs/common';
import { MessagePayload } from '../../core/models/MessagePayload';
import { ClientProxy } from '@nestjs/microservices';
import { Tenant } from '../TenantManager/entities/Tenant.entity';
import { SessionManagerContext } from '../SessionManager/sessionmanager.context';
import { SessionContext } from '../../core/models/SessionContext';
import { timeout as ObservableTimeout } from 'rxjs/operators';
import { throwError, lastValueFrom } from 'rxjs';

@Injectable()
export class ProcessorManagerService {
    constructor(@Inject('PRIMEBRICK_SERVICE') private busClient: ClientProxy /* private readonly sessionManagerContext: SessionManagerContext */) {}

    /**
     * Send a message to a microservice registered under specific action (like a queue name or topic).
     * The message will be automatically enriched with session context (which contains TENANT ALIAS, USER PROFILE, LANGUAGE CODE, etc.)
     * @param actionName The name of the action that will receive the message (look at GlobalRpcAction and ModuleRpcAction from sdk, but it can be any valid string)
     * @param payload The payload to send based on TPayload, it can be anything from primitive types to complex objects
     * @param timeout Timeout in milliseconds to wait before raise an exception; default 30000 (30s)
     * @remarks The message will be automatically enriched with session context (which contains TENANT ALIAS, USER PROFILE, LANGUAGE CODE, etc.)
     * @returns
     */
    async sendMessage<TPayload, TResult>(actionName: string, payload: TPayload, timeout = 30000): Promise<MessagePayload<TResult>> {
        //TODO: @mso -> Cause not always an microservice endpoint need a payload it should be declared as optional (payload?: TPayload) in order
        //to not force developer to specify NULL as TPayload
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

    /**
     * Send a message to a microservice registered under specific action (like a queue name or topic).
     * **USE ONLY ON APPLICATION BOOTSTRAP!!!** The message will contains an empty session context which contains supplied TENANT ALIAS, empty USER PROFILE, 'en' as LANGUAGE CODE)
     * @param tenant The tenant entity where collect first tenant alias and forcely set it to the message context
     * @param actionName The name of the action that will receive the message (look at GlobalRpcAction and ModuleRpcAction from sdk, but it can be any valid string)
     * @param payload The payload to send based on TPayload, it can be anything from primitive types to complex objects
     * @param timeout Timeout in milliseconds to wait before raise an exception; default 30000 (30s)
     * @remarks **USE ONLY ON APPLICATION BOOTSTRAP!!!** The message will contains an empty session context which contains supplied TENANT ALIAS, empty USER PROFILE, 'en' as LANGUAGE CODE)
     * @returns
     */
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
        // let connectionTimeout: NodeJS.Timeout = null;

        const response = await lastValueFrom(
            this.busClient.send<MessagePayload<TResult>, MessagePayload<TPayload>>(actionName, this.prepareMessage<TPayload>(payload, context)).pipe(
                ObservableTimeout({
                    each: timeout,
                    with: () => throwError(() => new Error(`The execution of microservice action [${actionName}] timed out after ${timeout}ms!`)),
                }),
            ),
        );

        // const respose = await Promise.race([
        //     this.busClient.send(actionName, this.prepareMessage<TPayload>(payload, context)).toPromise<MessagePayload<TResult>>(),

        //     new Promise<MessagePayload<TResult>>((res, rej) => {
        //         connectionTimeout = setTimeout(() => {
        //             rej(new Error(`The execution of microservice action [${actionName}] timed out after ${timeout}ms!`));
        //         }, timeout); // 30 second timeout
        //     }),
        // ]);

        // clearTimeout(connectionTimeout);
        return response;
    }

    private prepareMessage<T>(payload: T, context: SessionContext): MessagePayload<T> {
        const messagePayload = new MessagePayload<T>();
        messagePayload.data = payload;
        messagePayload.context = context;

        return messagePayload;
    }
}

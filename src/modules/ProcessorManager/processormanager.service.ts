import { Injectable, Inject } from '@nestjs/common';
import { MessagePayload } from './models/MessagePayload';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';

@Injectable()
export class ProcessorManagerService {
    constructor(@Inject('PRIMEBRICK_SERVICE') private busClient: ClientProxy) {}

    private prepareMessage(req: Request, payload: any): MessagePayload {
        const messagePayload = new MessagePayload();
        messagePayload.sessionId = '123';
        messagePayload.tenantAlias = req['tenantAlias'];
        messagePayload.data = payload;

        return messagePayload;
    }

    async sendMessage(req: Request, actionName: string, payload: any, timeout = 30000): Promise<any> {
        const respose = await Promise.race([
            this.busClient.send(actionName, this.prepareMessage(req, payload)).toPromise(),

            new Promise((res, rej) => {
                setTimeout(() => {
                    rej(new Error(`The processor ${actionName} timed out!`));
                }, timeout); // 3 second timeout
            }),
        ]);

        return respose;
    }
}

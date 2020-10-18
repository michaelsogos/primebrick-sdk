import { Injectable, Inject } from '@nestjs/common';
import { MessagePayload } from './models/MessagePayload';
import { ClientProxy } from '@nestjs/microservices';
import { Request } from 'express';

@Injectable()
export class ProcessorManagerService {
    constructor(@Inject('PRIMEBRICK_SERVICE') private busClient: ClientProxy) {}

    private prepareMessage<T>(req: Request, payload: T): MessagePayload<T> {
        const messagePayload = new MessagePayload<T>();
        messagePayload.data = payload;

        return messagePayload;
    }

    async sendMessage<T>(req: Request, actionName: string, payload: T, timeout = 30000): Promise<any> {
        const respose = await Promise.race([
            this.busClient.send(actionName, this.prepareMessage<T>(req, payload)).toPromise(),

            new Promise((res, rej) => {
                setTimeout(() => {
                    rej(new Error(`The processor ${actionName} timed out!`));
                }, timeout); // 30 second timeout
            }),
        ]);

        return respose;
    }
}

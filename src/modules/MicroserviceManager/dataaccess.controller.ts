import { Controller, Body, Post } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ModuleRpcAction } from '../../core/enums/ModuleRpcAction';
import { MessagePayload } from '../ProcessorManager/models/MessagePayload';
import { DataAccessService } from './dataaccess.service';
import { QueryPayload } from './models/QueryPayload';
import { QueryResult } from './models/QueryResult';
import { SavePayload } from './models/SavePayload';

@Controller()
export class DataAccessController {
    constructor(private readonly dataAccessService: DataAccessService) {}

    @MessagePattern(`${process.env.BRICK_NAME}.${ModuleRpcAction.DATA_FIND_MANY}`)
    async find(message: MessagePayload<QueryPayload>): Promise<MessagePayload<QueryResult>> {
        const response = await this.dataAccessService.find(message.data);
        return MessagePayload.wrap(response);
    }

    @MessagePattern(`${process.env.BRICK_NAME}.${ModuleRpcAction.DATA_FIND_ONE}`)
    async findOne(message: MessagePayload<QueryPayload>): Promise<MessagePayload<QueryResult>> {
        const response = await this.dataAccessService.findOne(message.data);
        return MessagePayload.wrap(response);
    }

    @MessagePattern(`${process.env.BRICK_NAME}.${ModuleRpcAction.DATA_SAVE}`)
    async save(message: MessagePayload<SavePayload>): Promise<MessagePayload<QueryResult>> {
        const response = await this.dataAccessService.save(message.data.entityName, message.data.entity);
        return MessagePayload.wrap(response);
    }

    @MessagePattern(`${process.env.BRICK_NAME}.${ModuleRpcAction.DATA_INFO}`)
    async info(message: MessagePayload<QueryPayload>): Promise<MessagePayload<QueryResult>> {
        const response = await this.dataAccessService.info(message.data);
        return MessagePayload.wrap(response);
    }
}

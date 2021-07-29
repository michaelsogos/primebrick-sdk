import { Controller, Body, Post } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DataRpcAction } from '../../core/enums/DataRpcAction';
import { MessagePayload } from '../ProcessorManager/models/MessagePayload';
import { DataAccessService } from './dataaccess.service';
import { DeleteOrArchiveManyPayload } from './models/DeleteOrArchiveManyPayload';
import { DeletePayload } from './models/DeletePayload';
import { QueryPayload } from './models/QueryPayload';
import { QueryResult } from './models/QueryResult';
import { SavePayload } from './models/SavePayload';

//TODO: @mso -> This controller should be AUTHENTICATED with AuthGuard
@Controller()
export class DataAccessController {
    constructor(private readonly dataAccessService: DataAccessService) {}

    @MessagePattern(`${process.brickName}.${DataRpcAction.DATA_FIND_MANY}`)
    async find(message: MessagePayload<QueryPayload>): Promise<MessagePayload<QueryResult>> {
        const response = await this.dataAccessService.find(message.data);
        return MessagePayload.wrap(response);
    }

    @MessagePattern(`${process.brickName}.${DataRpcAction.DATA_FIND_ONE}`)
    async findOne(message: MessagePayload<QueryPayload>): Promise<MessagePayload<QueryResult>> {
        const response = await this.dataAccessService.findOne(message.data);
        return MessagePayload.wrap(response);
    }

    @MessagePattern(`${process.brickName}.${DataRpcAction.DATA_SAVE}`)
    async save(message: MessagePayload<SavePayload>): Promise<MessagePayload<QueryResult>> {
        const response = await this.dataAccessService.save(message.data.entityName, message.data.entity);
        return MessagePayload.wrap(response);
    }

    @MessagePattern(`${process.brickName}.${DataRpcAction.DATA_DELETE}`)
    async delete(message: MessagePayload<DeletePayload>): Promise<MessagePayload<QueryResult>> {
        const response = await this.dataAccessService.delete(
            message.data.entityName,
            message.data.entityId,
            message.data.isRecoverable === false ? false : true,
        );
        return MessagePayload.wrap(response);
    }

    @MessagePattern(`${process.brickName}.${DataRpcAction.DATA_DELETE_MANY}`)
    async deleteMany(message: MessagePayload<DeleteOrArchiveManyPayload>): Promise<MessagePayload<QueryResult>> {
        const response = await this.dataAccessService.deleteMany(message.data.entityName, message.data.entityIds);
        return MessagePayload.wrap(response);
    }

    @MessagePattern(`${process.brickName}.${DataRpcAction.DATA_ARCHIVE}`)
    async archive(message: MessagePayload<DeletePayload>): Promise<MessagePayload<QueryResult>> {
        const response = await this.dataAccessService.archive(message.data.entityName, message.data.entityId);
        return MessagePayload.wrap(response);
    }

    @MessagePattern(`${process.brickName}.${DataRpcAction.DATA_ARCHIVE_MANY}`)
    async archiveMany(message: MessagePayload<DeleteOrArchiveManyPayload>): Promise<MessagePayload<QueryResult>> {
        const response = await this.dataAccessService.archiveMany(message.data.entityName, message.data.entityIds);
        return MessagePayload.wrap(response);
    }

    @MessagePattern(`${process.brickName}.${DataRpcAction.DATA_INFO}`)
    async info(message: MessagePayload<QueryPayload>): Promise<MessagePayload<QueryResult>> {
        const response = await this.dataAccessService.info(message.data);
        return MessagePayload.wrap(response);
    }
}

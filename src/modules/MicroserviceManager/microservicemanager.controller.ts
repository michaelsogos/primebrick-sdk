import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Brick } from '../../core/models/Brick';
import { DataImport } from '../../core/models/DataImport';
import { DataImportLog } from '../../core/models/DataImportLog';
import { InstallBrickResponse } from '../../core/models/InstallBrickResponse';
import { MessagePayload } from '../ProcessorManager/models/MessagePayload';
import { MicroserviceManagerService } from './microservicemanager.service';

@Controller()
export class MicroserviceManagerController {
    constructor(private readonly microserviceManagerService: MicroserviceManagerService) {}

    @MessagePattern(`${process.brickName}.brick:install`)
    async installBrick(): Promise<MessagePayload<InstallBrickResponse>> {
        const response = await this.microserviceManagerService.installBrick();
        return MessagePayload.wrap(response);
    }

    @MessagePattern(`${process.brickName}.data:import`)
    async importData(message: MessagePayload<DataImport>): Promise<MessagePayload<DataImportLog>> {
        const response = await this.microserviceManagerService.importData(message.data);
        return MessagePayload.wrap(response);
    }
}

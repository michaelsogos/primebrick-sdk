import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Brick } from '../../core/models/Brick';
import { InstallBrickResponse } from '../../core/models/InstallBrickResponse';
import { MessagePayload } from '../ProcessorManager/models/MessagePayload';
import { MicroserviceManagerService } from './microservicemanager.service';

@Controller()
export class MicroserviceManagerController {
    constructor(private readonly microserviceManagerService: MicroserviceManagerService) {}

    @MessagePattern(`${global['appModuleName']}-brick:install`)
    async installBrick(data: MessagePayload<Brick>): Promise<MessagePayload<InstallBrickResponse>> {
        const response = await this.microserviceManagerService.installBrick();
        return MessagePayload.wrap(response);
    }
}

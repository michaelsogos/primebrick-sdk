import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessagePayload } from '../modules/ProcessorManager/models/MessagePayload';
import { MicroserviceService } from './microservice.service';
import { Brick } from './models/Brick';
import { InstallBrickResponse } from './models/InstallBrickResponse';

@Controller()
export class MicroserviceController {
    constructor(private readonly microserviceService: MicroserviceService) {}

    @MessagePattern(`${global['appModuleName']}-brick:install`)
    async installBrick(data: MessagePayload<Brick>): Promise<MessagePayload<InstallBrickResponse>> {
        const response = await this.microserviceService.installBrick();
        return MessagePayload.wrap(response);
    }
}

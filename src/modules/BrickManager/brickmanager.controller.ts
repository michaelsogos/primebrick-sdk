import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { MessagePayload } from '../ProcessorManager/models/MessagePayload';
import { BrickManagerService } from './brickmanager.service';
import { Brick } from './models/Brick';

@Controller()
export class BrickManagerController {
    constructor(private readonly brickManagerService: BrickManagerService) {}

    @MessagePattern('brick:register')
    async registerBrick(data: MessagePayload<Brick>): Promise<boolean> {
        await this.brickManagerService.registerBrick(data);
        return true;
    }
}

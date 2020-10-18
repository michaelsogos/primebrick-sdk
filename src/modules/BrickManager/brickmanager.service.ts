import { Injectable } from '@nestjs/common';
import { MessagePayload } from '../ProcessorManager/models/MessagePayload';
import { TenantRepositoryService } from '../TenantManager/tenantrepository.service';
import { Brick } from './models/Brick';

@Injectable()
export class BrickManagerService {
    constructor(private readonly repositoryService: TenantRepositoryService) {}

    async registerBrick(payload: MessagePayload<Brick>): Promise<boolean> {
        return true;
    }
}

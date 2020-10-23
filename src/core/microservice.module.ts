import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Tenant } from '../modules/TenantManager/entities/Tenant.entity';
import { TenantManagerService } from '../modules/TenantManager/tenantmanager.service';
import { PrimeBrickModule } from './primebrick.module';
import { Brick } from './models/Brick';
import { RpcAction } from './enums/RpcAction';
import * as fs from 'fs';
import * as path from 'path';
import { ProcessorManagerService } from '../modules/ProcessorManager/processormanager.service';

@Injectable()
export class MicroserviceModule extends PrimeBrickModule implements OnApplicationBootstrap {
    constructor(readonly tenantManagerService: TenantManagerService, readonly processorManagerService: ProcessorManagerService) {
        super(tenantManagerService);
    }

    async onApplicationBootstrap(): Promise<void> {
        await super.onApplicationBootstrap();

        const pkJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json')).toString());

        const brick = new Brick();
        brick.code = pkJson.name;
        brick.description = pkJson.description;
        brick.version = pkJson.version;
        brick.autoInstall = pkJson.brickConfig.autoInstall;

        for (const tenant of global['tenants'] as Tenant[]) {
            await this.processorManagerService.sendMessageWithTenant<Brick>(tenant, RpcAction.REGISTER_BRICK, brick);
            //TODO: handle when registration fail for anything
        }
    }
}

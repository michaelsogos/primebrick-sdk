import { OnApplicationBootstrap } from '@nestjs/common';
import { Tenant } from '../modules/TenantManager/entities/Tenant.entity';
import { TenantManagerService } from '../modules/TenantManager/tenantmanager.service';
import { PrimeBrickModule } from './primebrick.module';
import { Brick } from './models/Brick';
import * as fs from 'fs';
import * as path from 'path';
import { ProcessorManagerService } from '../modules/ProcessorManager/processormanager.service';
import { AdvancedLogger } from './logger.service';
import { GlobalRpcAction } from './enums/GlobalRpcAction';
import { CommonHelper } from './utils/CommonHelper';

export class MicroserviceModule extends PrimeBrickModule implements OnApplicationBootstrap {
    constructor(
        readonly tenantManagerService: TenantManagerService,
        readonly processorManagerService: ProcessorManagerService,
        readonly logger: AdvancedLogger,
    ) {
        super(tenantManagerService);
        logger.setContext(global['appModuleName']);
    }

    async onApplicationBootstrap(): Promise<void> {
        await super.onApplicationBootstrap();

        const pkJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json')).toString());

        const brick = new Brick();
        brick.code = pkJson.name;
        brick.module = global['appModuleName'];
        brick.description = pkJson.description;
        brick.version = pkJson.version;
        brick.autoInstall = pkJson.brickConfig.autoInstall;
        brick.entities = CommonHelper.getRegisteredEntities();

        for (const tenant of global['tenants'] as Tenant[]) {
            const result = await this.processorManagerService.sendMessageWithTenant<Brick, boolean>(tenant, GlobalRpcAction.REGISTER_BRICK, brick);
            if (result.data) this.logger.debug(`The brick [${brick.code}] has been registered!`);

            //TODO: handle when registration fail for anything
        }
    }
}

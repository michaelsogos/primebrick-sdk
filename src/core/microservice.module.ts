import { OnApplicationBootstrap } from '@nestjs/common';
import { Tenant } from '../modules/TenantManager/entities/Tenant.entity';
import { TenantManagerService } from '../modules/TenantManager/tenantmanager.service';
import { PrimeBrickModule } from './primebrick.module';
import { Brick } from './models/Brick';
import * as fs from 'fs';
import * as path from 'path';
import { ProcessorManagerService } from '../modules/ProcessorManager/processormanager.service';
import { GlobalRpcAction } from './enums/GlobalRpcAction';
import { CommonHelper } from './utils/CommonHelper';
import { LogManagerService } from '../modules';

export class MicroserviceModule extends PrimeBrickModule implements OnApplicationBootstrap {
    constructor(
        readonly tenantManagerService: TenantManagerService,
        readonly processorManagerService: ProcessorManagerService,
        readonly logger: LogManagerService,
    ) {
        super(tenantManagerService, logger);
    }

    async onApplicationBootstrap(): Promise<void> {
        await super.onApplicationBootstrap();

        const pkJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json')).toString());

        const brick = new Brick();
        brick.code = pkJson.name;
        brick.name = process.brickName;
        brick.description = pkJson.description;
        brick.version = pkJson.version;
        brick.autoInstall = pkJson.brickConfig.autoInstall;
        brick.entities = CommonHelper.getRegisteredEntities();

        for (const tenant of global['tenants'] as Tenant[]) {
            await this.registerBrick(tenant, brick);
        }
    }

    async registerBrick(tenant: Tenant, brick: Brick) {
        try {
            //TODO: @mso -> Reduce timeout to at least 5 seconds because 30 are too much.
            //an idea is to add a kind of TIMEOUT in ENV file for default, one for IMPORTS and one for "FAST_CALLS" ?
            const result = await this.processorManagerService.sendMessageWithTenant<Brick, boolean>(tenant, GlobalRpcAction.REGISTER_BRICK, brick);
            if (result.data) this.logger.debug(`The brick [${brick.code}] has been registered for tenant [${tenant.code}]!`);
            else this.logger.debug(`The brick [${brick.code}] cannot be registered for tenant [${tenant.code}]!`);
        } catch (ex) {
            this.logger.error(ex);
        }
    }
}

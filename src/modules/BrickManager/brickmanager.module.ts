import { Module } from '@nestjs/common';
import { TenantManagerModule } from '../TenantManager/tenantmanager.module';
import { BrickManagerController } from './brickmanager.controller';
import { BrickManagerService } from './brickmanager.service';

@Module({
    imports: [TenantManagerModule],
    providers: [BrickManagerService],
    controllers: [BrickManagerController],
})
export class BrickManagerModule {}

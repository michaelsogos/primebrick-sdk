import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SessionManagerModule } from '../SessionManager/sessionmanager.module';
import { ProcessorManagerService } from './processormanager.service';

@Module({
    imports: [ClientsModule.register([{ name: 'PRIMEBRICK_SERVICE', transport: Transport.TCP }]), SessionManagerModule],
    controllers: [],
    providers: [ProcessorManagerService],
    exports: [ProcessorManagerService],
})
export class ProcessorManagerModule {}

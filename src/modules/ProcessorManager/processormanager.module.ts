import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigLoader } from '../../core/utils/ConfigLoader';
import { SessionManagerModule } from '../SessionManager/sessionmanager.module';
import { ProcessorManagerService } from './processormanager.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.app.config.env', '.logger.config.env', '.db.config.env', '.primebrick.config.env', '.env'],
            load: [ConfigLoader],
        }),
        ClientsModule.register([
            {
                name: 'PRIMEBRICK_SERVICE',
                transport: Transport.NATS,
                options: { url: process.env.NATS_URL || 'nats://localhost:4222' },
            },
        ]),
        SessionManagerModule,
    ],
    controllers: [],
    providers: [ProcessorManagerService],
    exports: [ProcessorManagerService],
})
export class ProcessorManagerModule implements OnApplicationBootstrap {
    constructor(@Inject('PRIMEBRICK_SERVICE') private client: ClientProxy) {}

    async onApplicationBootstrap() {
        await this.client.connect();
    }
}

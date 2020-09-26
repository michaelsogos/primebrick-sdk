import { Module } from '@nestjs/common';
import { SessionManagerContext } from './sessionmanager.context';
import { SessionManagerService } from './sessionmanager.service';

@Module({
    providers: [
        SessionManagerService,
        {
            provide: SessionManagerContext,
            useValue: SessionManagerContext.getInstance(),
        },
    ],
    exports: [SessionManagerService, SessionManagerContext],
})
export class SessionManagerModule {}

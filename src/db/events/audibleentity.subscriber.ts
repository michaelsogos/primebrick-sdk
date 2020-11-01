import { Inject } from '@nestjs/common';
import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { SessionContext } from '../../core';
import { SessionManagerContext } from '../../modules/SessionManager/sessionmanager.context';
import { AudibleEntity } from '../entities/audible.entity';

@EventSubscriber()
export class AudibleEntitySubscriber implements EntitySubscriberInterface<AudibleEntity> {
    constructor(@Inject(SessionManagerContext) private readonly sessionManagerContext: SessionManagerContext) {}

    /**
     * Indicates that this subscriber only listen to Post events.
     */
    listenTo() {
        return AudibleEntity;
    }

    /**
     * Called before post insertion.
     */
    beforeInsert(event: InsertEvent<AudibleEntity>) {
        const userId = this.getCurrentUser();
        event.entity.createdBy = userId;
        event.entity.updatedBy = userId;
        // event.metadata.columns[0].spatialFeatureTypell
    }

    beforeUpdate(event: UpdateEvent<AudibleEntity>) {
        event.entity.updatedBy = this.getCurrentUser();
    }

    beforeRemove(event: RemoveEvent<AudibleEntity>) {
        event.entity.deletedBy = this.getCurrentUser();
    }

    private getCurrentUser(): number {
        const sessionContext = this.sessionManagerContext;
        try {
            const context = sessionContext.get('context');
            return context.userProfile ? context.userProfile.id : -1;
        } catch (ex) {
            return -1;
        }
    }
}

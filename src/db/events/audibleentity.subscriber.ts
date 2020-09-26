import { EntitySubscriberInterface, EventSubscriber, InsertEvent, RemoveEvent, UpdateEvent } from 'typeorm';
import { SessionContext } from '../../core';
import { SessionManagerContext } from '../../modules/SessionManager/sessionmanager.context';
import { AudibleEntity } from '../entities/audible.entity';

@EventSubscriber()
export class AudibleEntitySubscriber implements EntitySubscriberInterface<AudibleEntity> {
    constructor(private readonly sessionManagerContext: SessionManagerContext) {}

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
        event.entity.createdBy = userId; //TODO: @mso -> Collect from context the LOGGED IN USER ID
        event.entity.updatedBy = userId; //TODO: @mso -> Collect from context the LOGGED IN USER ID
    }

    beforeUpdate(event: UpdateEvent<AudibleEntity>) {
        event.entity.updatedBy = this.getCurrentUser(); //TODO: @mso -> Collect from context the LOGGED IN USER ID
    }

    beforeRemove(event: RemoveEvent<AudibleEntity>) {
        event.entity.deletedBy = this.getCurrentUser(); //TODO: @mso -> Collect from context the LOGGED IN USER ID
    }

    private getCurrentUser(): number {
        const context: SessionContext = this.sessionManagerContext.get('context');
        return context.userProfile ? context.userProfile.id : -1;
    }
}

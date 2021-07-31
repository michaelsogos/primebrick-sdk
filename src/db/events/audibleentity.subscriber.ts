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
        if (event.entity) {
            //Valid only for save(), because insert() doesn't work with entity but go directly to DB
            const userId = this.getCurrentUser();
            event.entity.createdBy = userId;
            event.entity.updatedBy = userId;

            if (event.queryRunner.data['importing'] === true) {
                event.entity.importedBy = userId;
                event.entity.importedOn = new Date();
            }
        }
    }

    beforeUpdate(event: UpdateEvent<AudibleEntity>) {
        if (event.entity) {
            //Valid only for save() and softRemove(), because update() or softDelete() don't work with entity but go directly to DB
            //FIXME: @mso -> https://github.com/typeorm/typeorm/issues/7162
            const userId = this.getCurrentUser();
            event.entity.updatedBy = userId;

            if (event.queryRunner.data['importing'] === true) {
                event.entity.importedBy = userId;
                event.entity.importedOn = new Date();
            }

            if (event.queryRunner.data['action'] == 'soft-remove') event.entity.deletedBy = userId;
        }
    }

    // @mso -> This event cannot be used to set deleteBy because it will be call only when the record is going to be erased forever from DB
    // beforeRemove(event: RemoveEvent<AudibleEntity>) {
    //     if (event.entity) event.entity.deletedBy = this.getCurrentUser();
    // }

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

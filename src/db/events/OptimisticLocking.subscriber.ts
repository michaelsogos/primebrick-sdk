import { EventSubscriber, UpdateEvent, EntitySubscriberInterface } from 'typeorm';
import { OptimisticLockVersionMismatchError } from '../exceptions/OptimisticLockVersionMismatch.error';
import { AudibleEntity } from '../entities/audible.entity';

@EventSubscriber()
export class OptimisticLockingSubscriber implements EntitySubscriberInterface<AudibleEntity> {
    beforeUpdate(event: UpdateEvent<AudibleEntity>): void {
        //If entity is going to be archived then we don't check for optimistic lock
        //Theoretically a softRemove() or softDelete() should change only fields deletedOn, deletedBy, updatedOn and updatedBy
        if (event.queryRunner.data['action'] == 'soft-remove' || event.queryRunner.data['action'] == 'recover') return;

        // To know if an entity has a version number, we check if versionColumn
        // is defined in the metadatas of that entity.
        if (event.metadata.versionColumn && event.entity && event.databaseEntity) {
            // Getting the current version of the requested entity update
            const versionFromUpdate = event.entity.version;
            // Getting the entity's version from the database
            const versionFromDatabase = event.databaseEntity.version;
            // they should match otherwise someone has changed it underneath us
            if (versionFromDatabase !== versionFromUpdate) {
                throw new OptimisticLockVersionMismatchError(event.metadata.name, versionFromDatabase, versionFromUpdate);
            }
        }
    }
}

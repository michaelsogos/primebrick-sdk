import {
  EventSubscriber,
  UpdateEvent,
  EntitySubscriberInterface,
} from 'typeorm';
import { OptimisticLockVersionMismatchError } from '../exceptions/OptimisticLockVersionMismatch.error';
import { AudibleEntity } from '../entities/audible.entity';

@EventSubscriber()
export class OptimisticLockingSubscriber
  implements EntitySubscriberInterface<AudibleEntity> {
  beforeUpdate(event: UpdateEvent<AudibleEntity>): void {
    // To know if an entity has a version number, we check if versionColumn
    // is defined in the metadatas of that entity.
    if (event.metadata.versionColumn && event.entity) {
      // Getting the current version of the requested entity update
      const versionFromUpdate = event.entity.version;

      //   Reflect.get(
      //     event.entity,
      //     event.metadata.versionColumn.propertyName,
      //   );

      // Getting the entity's version from the database
      const versionFromDatabase = event.databaseEntity.version;
      // event.databaseEntity[event.metadata.versionColumn.propertyName];

      // they should match otherwise someone has changed it underneath us
      if (versionFromDatabase !== versionFromUpdate) {
        throw new OptimisticLockVersionMismatchError(
          event.metadata.name,
          versionFromDatabase,
          versionFromUpdate,
        );
      }
    }
  }
}

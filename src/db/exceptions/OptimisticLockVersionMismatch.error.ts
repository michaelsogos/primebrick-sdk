export class OptimisticLockVersionMismatchError extends Error {
  name = 'OptimisticLockVersionMismatchError';

  constructor(entity: string, expectedVersion: number, actualVersion: number) {
    super();
    Reflect.setPrototypeOf(this, OptimisticLockVersionMismatchError.prototype);
    this.message = `The optimistic lock on entity ${entity} failed, version ${expectedVersion} was expected, but is actually ${actualVersion}.`;
  }

  //TODO: @mso -> To improve debug, add detail about which fields\values changed in the mean time
  //   constructor(
  //     trackedEntity: BaseEntity,
  //     persistedEntity: BaseEntity,
  //     expectedVersion: number,
  //     actualVersion: number,
  //   ) {
  //     super();
  //     Reflect.setPrototypeOf(this, OptimisticLockVersionMismatchError.prototype);
  //     this.message = `The optimistic lock on entity ${entity} failed, version ${expectedVersion} was expected, but is actually ${actualVersion}.`;
  //   }
}

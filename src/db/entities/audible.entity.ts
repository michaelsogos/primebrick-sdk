import {
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    VersionColumn,
    BeforeInsert,
    BeforeUpdate,
    BeforeRemove,
} from 'typeorm';

export abstract class AudibleEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdOn: Date;

    @Column()
    createdBy: number;

    @UpdateDateColumn()
    updatedOn: Date;

    @Column()
    updatedBy: number;

    @DeleteDateColumn({ nullable: true })
    deletedOn: Date;

    @Column({ nullable: true })
    deletedBy: number;

    @VersionColumn()
    version: number;

    @Column({ unique: true, nullable: true })
    importId: string;

    @Column({ nullable: true })
    importedOn: Date;

    @Column({ nullable: true })
    importedBy: number;

    @BeforeUpdate()
    setAuditingFieldsOnUpdate(): void {
        this.updatedBy = -1; //TODO: @mso -> Collect from context the LOGGED IN USER ID
    }

    @BeforeInsert()
    setAuditingFieldsOnInsert(): void {
        this.createdBy = -1; //TODO: @mso -> Collect from context the LOGGED IN USER ID
        this.updatedBy = -1; //TODO: @mso -> Collect from context the LOGGED IN USER ID
    }

    @BeforeRemove()
    setAuditingFieldsOnRemove(): void {
        this.deletedBy = -1; //TODO: @mso -> Collect from context the LOGGED IN USER ID
    }
}

// class a implements EntitySubscriberInterface<AudibleEntity> {

//     listenTo(){
//         return AudibleEntity
//     }

//     beforeUpdate(event: UpdateEvent<AudibleEntity>){
// event.
//     }
// }

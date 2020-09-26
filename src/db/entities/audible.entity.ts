import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, VersionColumn } from 'typeorm';

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
}

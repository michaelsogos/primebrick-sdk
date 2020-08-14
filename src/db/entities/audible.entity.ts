import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, VersionColumn, BeforeInsert } from "typeorm";

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

	@BeforeInsert()
	setAuditingFields(): void {
		this.createdBy = -1; //TODO: @mso -> Collect from context the LOGGED IN USER ID
		this.updatedBy = -1; //TODO: @mso -> Collect from context the LOGGED IN USER ID
		//this.deleted_by = -1; //TODO: @mso -> Collect from context the LOGGED IN USER ID
	}
}

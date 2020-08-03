import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, VersionColumn, BeforeInsert } from "typeorm";

export abstract class AudibleEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@CreateDateColumn()
	created_on: Date;

	@Column()
	created_by: number;

	@UpdateDateColumn()
	updated_on: Date;

	@Column()
	updated_by: number;

	@DeleteDateColumn({ nullable: true })
	deleted_on: Date;

	@Column({ nullable: true })
	deleted_by: number;

	@VersionColumn()
	version: number;

	@BeforeInsert()
	setAuditingFields(): void {
		this.created_by = -1; //TODO: @mso -> Collect from context the LOGGED IN USER ID
		this.updated_by = -1; //TODO: @mso -> Collect from context the LOGGED IN USER ID
		//this.deleted_by = -1; //TODO: @mso -> Collect from context the LOGGED IN USER ID
	}
}

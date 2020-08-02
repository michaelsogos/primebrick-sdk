import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Tenant } from "./Tenant.entity";

@Entity("tenant_aliases")
export class TenantAlias {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	alias: string;

	@CreateDateColumn()
	created_on: Date;

	@UpdateDateColumn()
	updated_on: Date;

	@DeleteDateColumn()
	deleted_on: Date;

	@ManyToOne((type) => Tenant, (T) => T.tenant_aliases)
	@JoinColumn({ name: "tenant_id" })
	tenant: Tenant;
}

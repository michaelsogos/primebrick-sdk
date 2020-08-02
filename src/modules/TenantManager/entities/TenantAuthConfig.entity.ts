import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, JoinColumn } from "typeorm";
import { Tenant } from "./Tenant.entity";

@Entity("tenant_auth_configs")
export class TenantAuthConfig {
	@PrimaryGeneratedColumn()
	id: number;

	@CreateDateColumn()
	created_on: Date;

	@UpdateDateColumn()
	updated_on: Date;

	@DeleteDateColumn()
	deleted_on: Date;

	@Column({ enum: ["local", "oauth2", "saml2"] })
	auth_type: string;

	@Column("json")
	auth_config: string;

	@OneToOne((type) => Tenant, (T) => T.tenant_auth_config)
	@JoinColumn({ name: "tenant_id" })
	tenant: Tenant;
}

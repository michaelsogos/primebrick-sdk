import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, JoinColumn } from "typeorm";
import { Tenant } from "./Tenant.entity";

@Entity("tenant_theme_configs")
export class TenantThemeConfig {
	@PrimaryGeneratedColumn()
	id: number;

	@CreateDateColumn()
	created_on: Date;

	@UpdateDateColumn()
	updated_on: Date;

	@DeleteDateColumn()
	deleted_on: Date;

	@Column({ enum: ["light", "dark"] })
	theme: string;

	@Column()
	primary: string;

	@Column()
	secondary: string;

	@Column()
	tertiary: string;

	@Column()
	accent: string;

	@Column()
	error: string;

	@Column()
	warning: string;

	@Column()
	info: string;

	@Column()
	success: string;

	@OneToOne((type) => Tenant, (T) => T.tenant_theme_config)
	@JoinColumn({ name: "tenant_id" })
	tenant: Tenant;
}

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, OneToOne } from "typeorm";
import { TenantAlias } from "./TenantAlias.entity";
import { TenantDBConfig } from "./TenantDBConfig.entity";
import { TenantAuthConfig } from "./TenantAUTHConfig.entity";
import { TenantThemeConfig } from "./TenantThemeConfig.entity";

@Entity("tenants")
export class Tenant {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	code: string;

	@CreateDateColumn()
	created_on: Date;

	@UpdateDateColumn()
	updated_on: Date;

	@DeleteDateColumn()
	deleted_on: Date;

	@OneToMany((type) => TenantAlias, (T) => T.tenant)
	tenant_aliases: TenantAlias[];

	@OneToOne((type) => TenantDBConfig, (T) => T.tenant)
	tenant_db_config: TenantDBConfig;

	@OneToOne((type) => TenantAuthConfig, (T) => T.tenant)
	tenant_auth_config: TenantAuthConfig;

	@OneToOne((type) => TenantThemeConfig, (T) => T.tenant)
	tenant_theme_config: TenantThemeConfig;
}

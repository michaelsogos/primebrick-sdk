import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Tenant } from './Tenant.entity';

@Entity('tenant_db_configs')
export class TenantDBConfig {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_on: Date;

    @UpdateDateColumn()
    updated_on: Date;

    @DeleteDateColumn()
    deleted_on: Date;

    @Column()
    db_host: string;

    @Column()
    db_port: number;

    @Column()
    db_username: string;

    @Column()
    db_password: string;

    @Column()
    db_name: string;

    @Column({ default: false })
    enable_auto_migration: boolean;

    @Column({ default: false })
    enable_auto_seed: boolean;

    @OneToOne((type) => Tenant, (T) => T.tenant_db_config)
    @JoinColumn({ name: 'tenant_id' })
    tenant: Tenant;
}

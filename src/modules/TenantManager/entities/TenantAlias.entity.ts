import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TenantConfig } from './TenantConfig.entity';

@Entity('tenant_alias')
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

  @ManyToOne(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type => TenantConfig,
    tenant_config => tenant_config.tenant_alias,
  )
  @JoinColumn({ name: 'tenant_config_id' })
  tenant_config: TenantConfig;
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { TenantAlias } from './TenantAlias.entity';

@Entity('tenant_config')
export class TenantConfig {
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

  @OneToMany(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type => TenantAlias,
    tenant_alias => tenant_alias.tenant_config,
  )
  tenant_alias: TenantAlias[];
}

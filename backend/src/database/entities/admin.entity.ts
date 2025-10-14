import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinTable,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Exclude } from 'class-transformer';
import { Role } from './role.entity';
import { AdminLoginLog } from './admin-login-log.entity';
import { AdminOperationLog } from '../../modules/admin/entities/admin-operation-log.entity';
import { Merchant } from '../../modules/merchants/entities/merchant.entity';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '管理员ID' })
  id: number;

  @Column({
    type: 'bigint',
    name: 'merchant_id',
    default: 1,
    comment: '所属商户ID',
  })
  merchantId: number;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 255, comment: '密码' })
  @Exclude()
  password: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'real_name',
    comment: '真实姓名',
  })
  realName: string;

  @Column({ type: 'varchar', length: 100, unique: true, comment: '邮箱' })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '手机号' })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '头像URL' })
  avatar?: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：0-禁用，1-启用' })
  status: number;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'last_login_time',
    comment: '最后登录时间',
  })
  lastLoginTime?: Date;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'last_login_ip',
    comment: '最后登录IP',
  })
  lastLoginIp?: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    comment: '创建时间',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    comment: '更新时间',
  })
  updatedAt: Date;

  // 关联角色（多对多）
  @ManyToMany(() => Role, (role) => role.admins)
  @JoinTable({
    name: 'admin_roles',
    joinColumn: { name: 'admin_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  // 登录日志
  @OneToMany(() => AdminLoginLog, (log) => log.admin)
  loginLogs: AdminLoginLog[];

  // 操作日志
  @OneToMany(() => AdminOperationLog, (log) => log.admin)
  operationLogs: AdminOperationLog[];

  // 多对一关系：管理员-商户
  @ManyToOne(() => Merchant, (merchant) => merchant.admins)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;
}

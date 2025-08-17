import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Role } from './role.entity';
import { AdminLoginLog } from './admin-login-log.entity';
import { AdminOperationLog } from './admin-operation-log.entity';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '管理员ID' })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 255, comment: '密码' })
  password: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '真实姓名' })
  realName: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '邮箱' })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '手机号' })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '头像' })
  avatar: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：0-禁用，1-启用' })
  status: number;

  @Column({ type: 'datetime', nullable: true, comment: '最后登录时间' })
  lastLoginTime: Date;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: '最后登录IP',
  })
  lastLoginIp: string;

  @Column({ type: 'int', default: 0, comment: '登录次数' })
  loginCount: number;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;

  // 多对多关系：管理员-角色
  @ManyToMany(() => Role, (role) => role.admins)
  @JoinTable({
    name: 'admin_roles',
    joinColumn: { name: 'admin_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  // 一对多关系：管理员-登录日志
  @OneToMany(() => AdminLoginLog, (log: AdminLoginLog) => log.admin)
  loginLogs: AdminLoginLog[];

  // 一对多关系：管理员-操作日志
  @OneToMany(() => AdminOperationLog, (log: AdminOperationLog) => log.admin)
  operationLogs: AdminOperationLog[];
}

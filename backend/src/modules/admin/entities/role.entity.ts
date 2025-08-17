import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true, comment: '角色名称' })
  name: string;

  @Column({ length: 50, unique: true, comment: '角色代码' })
  code: string;

  @Column({ length: 100, nullable: true, comment: '角色描述' })
  description: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;

  // 多对多关系：角色-管理员
  @ManyToMany(() => Admin, (admin) => admin.roles)
  admins: Admin[];

  // 多对多关系：角色-权限
  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}

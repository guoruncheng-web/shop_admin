import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '角色ID' })
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '角色名称' })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '角色代码' })
  code: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '角色描述' })
  description?: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：0-禁用，1-启用' })
  status: number;

  @Column({ 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP', 
    comment: '创建时间' 
  })
  createdAt: Date;

  @Column({ 
    type: 'datetime', 
    nullable: true, 
    comment: '更新时间' 
  })
  updatedAt: Date;

  // 关联管理员（多对多）
  @ManyToMany(() => Admin, (admin) => admin.roles)
  admins: Admin[];

  // 关联权限（多对多）
  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}

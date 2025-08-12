import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '权限ID' })
  id: number;

  @Column({ type: 'varchar', length: 100, comment: '权限名称' })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true, comment: '权限代码' })
  code: string;

  @Column({ 
    type: 'tinyint', 
    comment: '权限类型：1-菜单权限，2-路由权限，3-按钮权限' 
  })
  type: number;

  @Column({ type: 'bigint', nullable: true, comment: '父级权限ID' })
  parentId?: number;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '路由路径' })
  path?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '组件名称' })
  component?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '图标' })
  icon?: string;

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

  // 关联角色（多对多）
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}

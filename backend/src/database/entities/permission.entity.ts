import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '权限ID' })
  id: number;

  @Column({ type: 'varchar', length: 50, comment: '权限名称' })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true, comment: '权限代码' })
  code: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '权限描述' })
  description?: string;

  @Column({ 
    type: 'enum', 
    enum: ['menu', 'button', 'api'], 
    default: 'menu', 
    comment: '权限类型：menu-菜单，button-按钮，api-接口' 
  })
  type: 'menu' | 'button' | 'api';

  @Column({ type: 'bigint', nullable: true, name: 'parent_id', comment: '父权限ID' })
  parentId?: number;

  @Column({ type: 'bigint', nullable: true, name: 'menu_id', comment: '关联菜单ID' })
  menuId?: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：0-禁用，1-启用' })
  status: number;

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
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  // 关联菜单（多对一）
  @ManyToOne(() => require('../../modules/menus/entities/menu.entity').Menu, { nullable: true })
  @JoinColumn({ name: 'menu_id' })
  menu?: any;

  // 子权限（一对多）
  @OneToMany(() => Permission, (permission) => permission.parent)
  children: Permission[];

  // 父权限（多对一）
  @ManyToOne(() => Permission, (permission) => permission.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: Permission;
}

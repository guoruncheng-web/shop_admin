import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Role } from './role.entity';
import { Menu } from '../../modules/menus/entities/menu.entity';

@Entity('role_menus')
@Index('uk_role_menu', ['roleId', 'menuId'], { unique: true })
@Index('idx_role_id', ['roleId'])
@Index('idx_menu_id', ['menuId'])
export class RoleMenu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'bigint',
    name: 'role_id',
    comment: '角色ID',
  })
  roleId: number;

  @Column({
    type: 'bigint',
    name: 'menu_id',
    comment: '菜单ID',
  })
  menuId: number;

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

  // 关联关系
  @ManyToOne(() => Role, (role) => role.roleMenus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Menu, (menu) => menu.roleMenus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_id' })
  menu: Menu;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Permission } from '../../../database/entities/permission.entity';

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, comment: '菜单名称' })
  name: string;

  @Column({ length: 100, nullable: true, comment: '菜单路径' })
  path: string;

  @Column({ length: 100, nullable: true, comment: '组件路径' })
  component: string;

  @Column({ length: 50, nullable: true, comment: '菜单图标' })
  icon: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'boolean', default: true, comment: '是否显示' })
  visible: boolean;

  @Column({ type: 'boolean', default: false, comment: '是否外链' })
  external: boolean;

  @Column({ type: 'boolean', default: false, comment: '是否缓存' })
  cache: boolean;

  @Column({ type: 'bigint', nullable: true, comment: '权限ID' })
  permissionId: number | null;

  @ManyToOne(() => Permission, { nullable: true })
  @JoinColumn({ name: 'permissionId' })
  permission: Permission;

  @Column({ type: 'int', default: 1, comment: '菜单类型：1目录，2菜单，3按钮' })
  type: number;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '按钮标识（用于前端控制显示隐藏）' })
  buttonKey: string | null;

  @Column({ type: 'boolean', default: true, comment: '状态：true启用，false禁用' })
  status: boolean;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children: Menu[];

  @ManyToOne(() => Menu, (menu) => menu.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Menu | null;

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
}

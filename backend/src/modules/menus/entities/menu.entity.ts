import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Permission } from '../../../database/entities/permission.entity';

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  // 基础路由信息
  @Column({ length: 100, comment: '路由名称/菜单名称' })
  name: string;

  @Column({ length: 200, nullable: true, comment: '路由路径' })
  path: string;

  @Column({ length: 200, nullable: true, comment: '组件路径' })
  component: string;

  @Column({ length: 200, nullable: true, comment: '重定向路径' })
  redirect: string;

  // Meta 属性字段
  @Column({ length: 100, comment: '菜单标题（显示名称）' })
  title: string;

  @Column({ length: 100, nullable: true, comment: '菜单图标' })
  icon: string;

  @Column({ length: 100, nullable: true, comment: '激活状态图标' })
  activeIcon: string;

  @Column({ type: 'int', default: 0, comment: '排序号（用于菜单排序）' })
  orderNum: number;

  // 显示控制
  @Column({
    type: 'tinyint',
    default: 0,
    comment: '是否在菜单中隐藏：0-显示，1-隐藏',
  })
  hideInMenu: number;

  @Column({
    type: 'tinyint',
    default: 0,
    comment: '子菜单是否在菜单中隐藏：0-显示，1-隐藏',
  })
  hideChildrenInMenu: number;

  @Column({
    type: 'tinyint',
    default: 0,
    comment: '是否在面包屑中隐藏：0-显示，1-隐藏',
  })
  hideInBreadcrumb: number;

  @Column({
    type: 'tinyint',
    default: 0,
    comment: '是否在标签页中隐藏：0-显示，1-隐藏',
  })
  hideInTab: number;

  // 功能控制
  @Column({
    type: 'tinyint',
    default: 0,
    comment: '是否开启KeepAlive缓存：0-关闭，1-开启',
  })
  keepAlive: number;

  @Column({
    type: 'tinyint',
    default: 0,
    comment: '是否忽略权限直接访问：0-需要权限，1-忽略权限',
  })
  ignoreAccess: number;

  @Column({
    type: 'tinyint',
    default: 0,
    comment: '是否固定标签页：0-不固定，1-固定',
  })
  affixTab: number;

  @Column({ type: 'int', default: 0, comment: '固定标签页的排序' })
  affixTabOrder: number;

  // 外链和iframe
  @Column({ type: 'tinyint', default: 0, comment: '是否外链：0-否，1-是' })
  isExternal: number;

  @Column({ length: 500, nullable: true, comment: '外链地址' })
  externalLink: string;

  @Column({ length: 500, nullable: true, comment: 'iframe地址' })
  iframeSrc: string;

  @Column({
    type: 'tinyint',
    default: 0,
    comment: '是否在新窗口打开：0-否，1-是',
  })
  openInNewWindow: number;

  // 徽标配置
  @Column({ length: 50, nullable: true, comment: '徽标文本' })
  badge: string;

  @Column({
    type: 'enum',
    enum: ['dot', 'normal'],
    default: 'normal',
    comment: '徽标类型',
  })
  badgeType: 'dot' | 'normal';

  @Column({ length: 50, default: 'default', comment: '徽标颜色变体' })
  badgeVariants: string;

  // 权限和访问控制
  @Column({ type: 'json', nullable: true, comment: '权限标识数组（角色权限）' })
  authority: string[];

  @Column({
    type: 'tinyint',
    default: 0,
    comment: '菜单可见但访问被禁止：0-否，1-是',
  })
  menuVisibleWithForbidden: number;

  @Column({ length: 200, nullable: true, comment: '激活的父级菜单路径' })
  activePath: string;

  // 标签页控制
  @Column({
    type: 'int',
    default: -1,
    comment: '标签页最大打开数量（-1为无限制）',
  })
  maxNumOfOpenTab: number;

  @Column({
    type: 'tinyint',
    default: 1,
    comment: '是否使用完整路径作为key：0-否，1-是',
  })
  fullPathKey: number;

  // 布局控制
  @Column({
    type: 'tinyint',
    default: 0,
    comment: '是否不使用基础布局：0-使用，1-不使用',
  })
  noBasicLayout: number;

  // 菜单类型和状态
  @Column({
    type: 'tinyint',
    default: 1,
    comment: '菜单类型：1-目录，2-菜单，3-按钮',
  })
  type: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：0-禁用，1-启用' })
  status: number;

  // 层级关系
  @Column({ type: 'bigint', nullable: true, comment: '父菜单ID' })
  parentId: number;

  @Column({ type: 'tinyint', default: 1, comment: '菜单层级' })
  level: number;

  @Column({
    length: 500,
    nullable: true,
    comment: '路径ID串（用于快速查询祖先节点）',
  })
  pathIds: string;

  // 权限关联
  @Column({ type: 'bigint', nullable: true, comment: '关联权限ID' })
  permissionId: number | null;

  @Column({ length: 100, nullable: true, comment: '按钮权限标识' })
  buttonKey: string | null;

  // 查询参数
  @Column({ type: 'json', nullable: true, comment: '菜单携带的查询参数' })
  queryParams: Record<string, any>;

  // 关联关系
  @ManyToOne(() => Permission, { nullable: true })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children: Menu[];

  @ManyToOne(() => Menu, (menu) => menu.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Menu | null;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;
}

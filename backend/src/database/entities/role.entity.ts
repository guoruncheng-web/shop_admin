import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  OneToMany,
  JoinTable,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Permission } from './permission.entity';
import { RoleMenu } from './role-menu.entity';
import { Merchant } from '../../modules/merchants/entities/merchant.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '角色ID' })
  id: number;

  @Column({
    type: 'bigint',
    name: 'merchant_id',
    default: 1,
    comment: '所属商户ID',
  })
  merchantId: number;

  @Column({ type: 'varchar', length: 50, comment: '角色名称' })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true, comment: '角色代码' })
  code: string;

  @Column({ type: 'varchar', length: 200, nullable: true, comment: '角色描述' })
  description?: string;

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

  // 关联菜单（通过中间表）
  @OneToMany(() => RoleMenu, (roleMenu) => roleMenu.role)
  roleMenus: RoleMenu[];

  // 多对一关系：角色-商户
  @ManyToOne(() => Merchant, (merchant) => merchant.roles)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;
}

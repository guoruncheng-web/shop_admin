import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true, comment: '权限名称' })
  name: string;

  @Column({ length: 100, unique: true, comment: '权限代码' })
  code: string;

  @Column({ length: 200, nullable: true, comment: '权限描述' })
  description: string;

  @Column({ length: 50, nullable: true, comment: '权限分组' })
  group: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @CreateDateColumn({ type: 'timestamp', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updatedAt: Date;

  // 多对多关系：权限-角色
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}

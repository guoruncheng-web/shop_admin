import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
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
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Resource } from './resource.entity';
import { Merchant } from '../../merchants/entities/merchant.entity';

@Entity('resource_categories')
export class ResourceCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'bigint',
    name: 'merchant_id',
    default: 1,
    comment: '所属商户ID',
  })
  merchantId: number;

  @Column({ length: 100, comment: '分类名称' })
  name: string;

  @Column({ name: 'parent_id', nullable: true, comment: '父分类ID' })
  parentId: number;

  @Column({
    type: 'tinyint',
    default: 1,
    comment: '分类层级：1-一级分类，2-二级分类',
  })
  level: number;

  @Column({ name: 'sort_order', default: 0, comment: '排序字段' })
  sortOrder: number;

  @Column({ type: 'tinyint', default: 1, comment: '状态：1-启用，0-禁用' })
  status: number;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => ResourceCategory, (category) => category.children)
  @JoinColumn({ name: 'parent_id' })
  parent: ResourceCategory;

  @OneToMany(() => ResourceCategory, (category) => category.parent)
  children: ResourceCategory[];

  @OneToMany(() => Resource, (resource) => resource.category)
  resources: Resource[];

  // 多对一关系：资源分类-商户
  @ManyToOne(() => Merchant, { nullable: false })
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;
}

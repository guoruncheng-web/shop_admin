import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '分类ID' })
  id: number;

  @Column({ type: 'bigint', name: 'merchant_id', comment: '商户ID' })
  merchantId: number;

  @Column({
    type: 'bigint',
    name: 'parent_id',
    default: 0,
    comment: '父分类ID（0为顶级）',
  })
  parentId: number;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'category_name',
    comment: '分类名称',
  })
  categoryName: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'category_code',
    nullable: true,
    comment: '分类编码',
  })
  categoryCode: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '分类图标URL',
  })
  icon: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '分类图片URL',
  })
  image: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: '分类横幅图',
  })
  banner: string;

  @Column({ type: 'text', nullable: true, comment: '分类描述' })
  description: string;

  @Column({ type: 'tinyint', default: 1, comment: '分类层级 1/2/3' })
  level: number;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'path_ids',
    nullable: true,
    comment: '路径ID（逗号分隔）',
  })
  pathIds: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'path_names',
    nullable: true,
    comment: '路径名称',
  })
  pathNames: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({
    type: 'tinyint',
    name: 'is_show',
    default: 1,
    comment: '是否显示 0-否 1-是',
  })
  isShow: number;

  @Column({
    type: 'tinyint',
    name: 'is_recommend',
    default: 0,
    comment: '是否推荐 0-否 1-是',
  })
  isRecommend: number;

  @Column({
    type: 'int',
    name: 'product_count',
    default: 0,
    comment: '商品数量（冗余字段）',
  })
  productCount: number;

  @Column({
    type: 'bigint',
    name: 'template_id',
    nullable: true,
    comment: '详情模板ID',
  })
  templateId: number;

  @Column({
    type: 'tinyint',
    default: 1,
    comment: '状态 0-禁用 1-启用',
  })
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

  @Column({
    type: 'bigint',
    name: 'created_by',
    nullable: true,
    comment: '创建人ID',
  })
  createdBy: number;

  @Column({
    type: 'bigint',
    name: 'updated_by',
    nullable: true,
    comment: '更新人ID',
  })
  updatedBy: number;

  // Relations
  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  // Self reference for parent-child relationship
  @ManyToOne(() => Category, (category) => category.children)
  @JoinColumn({ name: 'parent_id' })
  parent: Category;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];
}

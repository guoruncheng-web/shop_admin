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
import { SkuSpecValue } from './sku-spec-value.entity';

@Entity('sku_spec_names')
export class SkuSpecName {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '规格名称ID' })
  id: number;

  @Column({ type: 'bigint', name: 'merchant_id', comment: '商户ID' })
  merchantId: number;

  @Column({ type: 'bigint', name: 'product_id', comment: '商品ID' })
  productId: number;

  @Column({ type: 'varchar', length: 50, name: 'spec_name', comment: '规格名称（颜色、尺寸、材质等）' })
  specName: string;

  @Column({ type: 'tinyint', name: 'spec_level', comment: '规格级别 1-一级 2-二级 3-三级' })
  specLevel: number;

  @Column({ type: 'bigint', name: 'parent_id', nullable: true, comment: '父规格ID（二三级需要）' })
  parentId: number;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'tinyint', name: 'is_required', default: 1, comment: '是否必选 0-否 1-是' })
  isRequired: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => SkuSpecName, (specName) => specName.children)
  @JoinColumn({ name: 'parent_id' })
  parent: SkuSpecName;

  @OneToMany(() => SkuSpecName, (specName) => specName.parent)
  children: SkuSpecName[];

  @OneToMany(() => SkuSpecValue, (specValue) => specValue.specName)
  specValues: SkuSpecValue[];
}

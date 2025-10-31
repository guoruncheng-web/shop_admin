import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Product } from '../../products/entities/product.entity';
import { SkuSpecValue } from '../../sku-spec-values/entities/sku-spec-value.entity';

@Entity('sku_spec_names')
export class SkuSpecName {
  @PrimaryGeneratedColumn({ comment: '规格名称ID' })
  id: number;

  @Column({ name: 'merchant_id', comment: '商户ID' })
  merchantId: number;

  @Column({ name: 'product_id', comment: '商品ID' })
  productId: number;

  @Column({
    name: 'spec_name',
    length: 50,
    comment: '规格名称，如：颜色、尺寸、材质',
  })
  specName: string;

  @Column({
    name: 'spec_level',
    type: 'tinyint',
    comment: '规格层级：1=一级规格，2=二级规格，3=三级规格',
  })
  specLevel: number;

  @Column({
    name: 'parent_id',
    nullable: true,
    comment: '父级规格ID，用于规格关联',
  })
  parentId: number;

  @Column({ type: 'int', default: 0, comment: '排序值，数字越小越靠前' })
  sort: number;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;

  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToMany(() => SkuSpecValue, (specValue) => specValue.specName)
  specValues: SkuSpecValue[];

  @ManyToOne(() => SkuSpecName, (specName) => specName.children)
  @JoinColumn({ name: 'parent_id' })
  parent: SkuSpecName;

  @OneToMany(() => SkuSpecName, (specName) => specName.parent)
  children: SkuSpecName[];
}

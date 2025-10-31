import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Product } from './product.entity';
import { SkuSpecName } from './sku-spec-name.entity';

@Entity('sku_spec_values')
export class SkuSpecValue {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '规格值ID' })
  id: number;

  @Column({ type: 'bigint', name: 'merchant_id', comment: '商户ID' })
  merchantId: number;

  @Column({ type: 'bigint', name: 'product_id', comment: '商品ID' })
  productId: number;

  @Column({ type: 'bigint', name: 'spec_name_id', comment: '规格名称ID' })
  specNameId: number;

  @Column({ type: 'varchar', length: 100, name: 'spec_value', comment: '规格值（红色、XL、纯棉等）' })
  specValue: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '规格图片（如颜色图）' })
  image: string;

  @Column({ type: 'varchar', length: 20, name: 'color_hex', nullable: true, comment: '颜色值（#FF0000）' })
  colorHex: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'extra_price', default: 0, comment: '额外加价' })
  extraPrice: number;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'tinyint', name: 'is_default', default: 0, comment: '是否默认 0-否 1-是' })
  isDefault: number;

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

  @ManyToOne(() => SkuSpecName, (specName) => specName.specValues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spec_name_id' })
  specName: SkuSpecName;
}

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
import { Product } from '../../products/entities/product.entity';
import { SkuSpecValue } from './sku-spec-value.entity';

@Entity('product_skus')
export class ProductSku {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: 'SKU ID' })
  id: number;

  @Column({ type: 'bigint', name: 'merchant_id', comment: '商户ID' })
  merchantId: number;

  @Column({ type: 'bigint', name: 'product_id', comment: '商品ID' })
  productId: number;

  @Column({ type: 'varchar', length: 100, name: 'sku_no', unique: true, comment: 'SKU编号' })
  skuNo: string;

  @Column({ type: 'varchar', length: 200, name: 'sku_name', nullable: true, comment: 'SKU名称' })
  skuName: string;

  @Column({ type: 'bigint', name: 'spec_value_id_1', nullable: true, comment: '一级规格值ID' })
  specValueId1: number;

  @Column({ type: 'bigint', name: 'spec_value_id_2', nullable: true, comment: '二级规格值ID' })
  specValueId2: number;

  @Column({ type: 'bigint', name: 'spec_value_id_3', nullable: true, comment: '三级规格值ID' })
  specValueId3: number;

  @Column({ type: 'varchar', length: 500, name: 'spec_text', nullable: true, comment: 'SKU规格文本（红色-XL-纯棉）' })
  specText: string;

  @Column({ type: 'json', name: 'spec_json', nullable: true, comment: '规格JSON' })
  specJson: Record<string, string>;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: 'SKU主图' })
  image: string;

  @Column({ type: 'json', nullable: true, comment: 'SKU图片列表' })
  images: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'original_price', default: 0, comment: '原价' })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, comment: '售价' })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'cost_price', default: 0, comment: '成本价' })
  costPrice: number;

  @Column({ type: 'int', default: 0, comment: '库存' })
  stock: number;

  @Column({ type: 'int', name: 'warning_stock', default: 10, comment: '预警库存' })
  warningStock: number;

  @Column({ type: 'int', default: 0, comment: '销量' })
  sales: number;

  @Column({ type: 'int', name: 'lock_stock', default: 0, comment: '锁定库存（订单未支付）' })
  lockStock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '重量(kg)' })
  weight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '体积(m³)' })
  volume: number;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '条形码' })
  barcode: string;

  @Column({ type: 'varchar', length: 500, name: 'qr_code', nullable: true, comment: '二维码URL' })
  qrCode: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态 0-禁用 1-启用' })
  status: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true, comment: '软删除时间' })
  deletedAt: Date;

  // Relations
  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => SkuSpecValue)
  @JoinColumn({ name: 'spec_value_id_1' })
  specValue1: SkuSpecValue;

  @ManyToOne(() => SkuSpecValue)
  @JoinColumn({ name: 'spec_value_id_2' })
  specValue2: SkuSpecValue;

  @ManyToOne(() => SkuSpecValue)
  @JoinColumn({ name: 'spec_value_id_3' })
  specValue3: SkuSpecValue;
}

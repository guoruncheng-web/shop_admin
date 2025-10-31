import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Product } from '../../products/entities/product.entity';
import { SkuSpecValue } from '../../sku-spec-values/entities/sku-spec-value.entity';

@Entity('product_skus')
export class ProductSku {
  @PrimaryGeneratedColumn({ comment: 'SKU ID' })
  id: number;

  @Column({ name: 'merchant_id', comment: '商户ID' })
  merchantId: number;

  @Column({ name: 'product_id', comment: '商品ID' })
  productId: number;

  @Column({ name: 'sku_code', length: 50, unique: true, comment: 'SKU编号' })
  skuCode: string;

  @Column({
    name: 'spec_value_id_1',
    nullable: true,
    comment: '一级规格值ID',
  })
  specValueId1: number;

  @Column({
    name: 'spec_value_id_2',
    nullable: true,
    comment: '二级规格值ID',
  })
  specValueId2: number;

  @Column({
    name: 'spec_value_id_3',
    nullable: true,
    comment: '三级规格值ID',
  })
  specValueId3: number;

  @Column({ name: 'spec_text', length: 255, comment: '规格文本' })
  specText: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    comment: 'SKU价格',
  })
  price: number;

  @Column({
    name: 'market_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '市场价',
  })
  marketPrice: number;

  @Column({
    name: 'cost_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '成本价',
  })
  costPrice: number;

  @Column({ type: 'int', default: 0, comment: 'SKU库存' })
  stock: number;

  @Column({
    name: 'warning_stock',
    type: 'int',
    default: 10,
    comment: '库存预警值',
  })
  warningStock: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 3,
    nullable: true,
    comment: '重量（kg）',
  })
  weight: number;

  @Column({
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
    comment: '体积（立方米）',
  })
  volume: number;

  @Column({ length: 100, nullable: true, comment: '条形码' })
  barcode: string;

  @Column({ length: 255, nullable: true, comment: 'SKU图片' })
  image: string;

  @Column({
    type: 'tinyint',
    default: 1,
    comment: '状态：0=禁用，1=启用',
  })
  status: number;

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

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
import { Brand } from '../../brands/entities/brand.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '商品ID' })
  id: number;

  @Column({ type: 'bigint', name: 'merchant_id', comment: '商户ID' })
  merchantId: number;

  @Column({ type: 'bigint', name: 'brand_id', nullable: true, comment: '品牌ID' })
  brandId: number;

  @Column({ type: 'bigint', name: 'category_id', comment: '分类ID' })
  categoryId: number;

  @Column({ type: 'varchar', length: 200, name: 'product_name', comment: '商品名称' })
  productName: string;

  @Column({ type: 'varchar', length: 100, name: 'product_no', unique: true, comment: '商品编号' })
  productNo: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '副标题/卖点' })
  subtitle: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '关键词' })
  keywords: string;

  @Column({ type: 'varchar', length: 500, name: 'main_image', nullable: true, comment: '商品主图URL' })
  mainImage: string;

  @Column({ type: 'json', nullable: true, comment: '商品图片列表' })
  images: string[];

  @Column({ type: 'varchar', length: 500, name: 'video_url', nullable: true, comment: '商品视频URL' })
  videoUrl: string;

  @Column({ type: 'text', nullable: true, comment: '商品详情HTML' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'original_price', default: 0, comment: '市场价/划线价' })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: '商品价格（仅供参考）' })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'cost_price', nullable: true, comment: '成本价（仅供参考）' })
  costPrice: number;

  @Column({ type: 'int', default: 0, comment: '真实销量' })
  sales: number;

  @Column({ type: 'int', name: 'virtual_sales', default: 0, comment: '虚拟销量' })
  virtualSales: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '重量(kg)' })
  weight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, comment: '体积(m³)' })
  volume: number;

  @Column({ type: 'varchar', length: 20, default: '件', comment: '计量单位' })
  unit: string;

  @Column({ type: 'tinyint', default: 1, comment: '商品状态 0-已下架 1-已上架 2-待审核' })
  status: number;

  @Column({ type: 'tinyint', name: 'is_hot', default: 0, comment: '是否热销 0-否 1-是' })
  isHot: number;

  @Column({ type: 'tinyint', name: 'is_new', default: 0, comment: '是否新品 0-否 1-是' })
  isNew: number;

  @Column({ type: 'tinyint', name: 'is_recommend', default: 0, comment: '是否推荐 0-否 1-是' })
  isRecommend: number;

  @Column({ type: 'tinyint', name: 'is_discount', default: 0, comment: '是否折扣 0-否 1-是' })
  isDiscount: number;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sort: number;

  @Column({ type: 'int', name: 'view_count', default: 0, comment: '浏览次数' })
  viewCount: number;

  @Column({ type: 'int', name: 'favorite_count', default: 0, comment: '收藏次数' })
  favoriteCount: number;

  @Column({ type: 'int', name: 'share_count', default: 0, comment: '分享次数' })
  shareCount: number;

  @Column({ type: 'int', name: 'comment_count', default: 0, comment: '评论数量' })
  commentCount: number;

  @Column({ type: 'bigint', name: 'delivery_template_id', nullable: true, comment: '运费模板ID' })
  deliveryTemplateId: number;

  @Column({ type: 'int', name: 'return_days', default: 7, comment: '退货天数' })
  returnDays: number;

  @Column({ type: 'json', name: 'service_guarantee', nullable: true, comment: '服务保障' })
  serviceGuarantee: string[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;

  @Column({ type: 'bigint', name: 'created_by', nullable: true, comment: '创建人ID' })
  createdBy: number;

  @Column({ type: 'bigint', name: 'updated_by', nullable: true, comment: '更新人ID' })
  updatedBy: number;

  @Column({ type: 'timestamp', name: 'deleted_at', nullable: true, comment: '软删除时间' })
  deletedAt: Date;

  // Relations
  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @ManyToOne(() => Brand)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}

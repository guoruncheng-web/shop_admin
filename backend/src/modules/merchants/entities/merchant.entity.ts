import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from '../../../database/entities/role.entity';
import { Admin } from '../../../database/entities/admin.entity';
import { Menu } from '../../menus/entities/menu.entity';
import { Resource } from '../../resource/entities/resource.entity';
import { ResourceCategory } from '../../resource/entities/resource-category.entity';

@Entity('merchants')
export class Merchant {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '商户ID' })
  id: number;

  // 基础信息
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    name: 'merchant_code',
    comment: '商户编码（唯一标识）',
  })
  merchantCode: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'merchant_name',
    comment: '商户名称',
  })
  merchantName: string;

  @Column({
    type: 'tinyint',
    default: 1,
    name: 'merchant_type',
    comment: '商户类型：1-超级商户（平台），2-普通商户',
  })
  merchantType: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'legal_person',
    comment: '法人代表',
  })
  legalPerson: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'business_license',
    comment: '营业执照号',
  })
  businessLicense: string;

  // 联系信息
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'contact_name',
    comment: '联系人姓名',
  })
  contactName: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    name: 'contact_phone',
    comment: '联系电话',
  })
  contactPhone: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'contact_email',
    comment: '联系邮箱',
  })
  contactEmail: string;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '商户地址' })
  address: string;

  // 认证信息
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '商户Logo' })
  logo: string;

  @Column({ type: 'text', nullable: true, comment: '商户描述' })
  description: string;

  @Column({
    type: 'tinyint',
    default: 0,
    name: 'certification_status',
    comment: '认证状态：0-未认证，1-审核中，2-已认证，3-认证失败',
  })
  certificationStatus: number;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'certification_time',
    comment: '认证时间',
  })
  certificationTime: Date;

  @Column({
    type: 'json',
    nullable: true,
    name: 'certification_docs',
    comment: '认证文件JSON数组',
  })
  certificationDocs: string[];

  // 经营信息
  @Column({
    type: 'text',
    nullable: true,
    name: 'business_scope',
    comment: '经营范围',
  })
  businessScope: string;

  @Column({
    type: 'json',
    nullable: true,
    name: 'category_ids',
    comment: '经营类目ID数组',
  })
  categoryIds: number[];

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'settlement_account',
    comment: '结算账户',
  })
  settlementAccount: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'settlement_bank',
    comment: '结算银行',
  })
  settlementBank: string;

  // 状态和配额
  @Column({
    type: 'tinyint',
    default: 1,
    comment: '状态：0-禁用，1-启用，2-冻结',
  })
  status: number;

  @Column({
    type: 'timestamp',
    nullable: true,
    name: 'expire_time',
    comment: '到期时间（套餐有效期）',
  })
  expireTime: Date;

  @Column({
    type: 'int',
    default: 1000,
    name: 'max_products',
    comment: '最大商品数量',
  })
  maxProducts: number;

  @Column({
    type: 'int',
    default: 10,
    name: 'max_admins',
    comment: '最大管理员数量',
  })
  maxAdmins: number;

  @Column({
    type: 'bigint',
    default: 10737418240,
    name: 'max_storage',
    comment: '最大存储空间(字节)，默认10GB',
  })
  maxStorage: number;

  // 财务信息
  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0.0,
    name: 'commission_rate',
    comment: '平台抽成比例（%）',
  })
  commissionRate: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0.0,
    comment: '账户余额',
  })
  balance: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0.0,
    name: 'frozen_balance',
    comment: '冻结金额',
  })
  frozenBalance: number;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0.0,
    name: 'total_sales',
    comment: '累计销售额',
  })
  totalSales: number;

  // 配置信息
  @Column({ type: 'json', nullable: true, comment: '商户配置JSON' })
  config: Record<string, any>;

  @Column({
    type: 'varchar',
    length: 64,
    unique: true,
    nullable: true,
    name: 'api_key',
    comment: 'API密钥',
  })
  apiKey: string;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
    name: 'api_secret',
    comment: 'API密钥',
  })
  apiSecret: string;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
    name: 'webhook_url',
    comment: 'Webhook回调地址',
  })
  webhookUrl: string;

  // 时间戳
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
    nullable: true,
    name: 'created_by',
    comment: '创建人ID',
  })
  createdBy: number;

  @Column({
    type: 'bigint',
    nullable: true,
    name: 'updated_by',
    comment: '更新人ID',
  })
  updatedBy: number;

  // 关联关系
  @OneToMany(() => Role, (role) => role.merchant)
  roles: Role[];

  @OneToMany(() => Admin, (admin) => admin.merchant)
  admins: Admin[];

  @OneToMany(() => Menu, (menu) => menu.merchant)
  menus: Menu[];

  @OneToMany(() => Resource, (resource) => resource.merchant)
  resources: Resource[];

  @OneToMany(() => ResourceCategory, (category) => category.merchant)
  resourceCategories: ResourceCategory[];
}

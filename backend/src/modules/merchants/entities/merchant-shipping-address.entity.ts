import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Merchant } from './merchant.entity';

@Entity('merchant_shipping_addresses')
export class MerchantShippingAddress {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '发货地址ID' })
  id: number;

  @Column({
    type: 'bigint',
    unique: true,
    name: 'merchant_id',
    comment: '商户ID',
  })
  merchantId: number;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'contact_name',
    comment: '联系人姓名',
  })
  contactName: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'contact_phone',
    comment: '联系电话',
  })
  contactPhone: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'province_code',
    comment: '省份编码',
  })
  provinceCode: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'province_name',
    comment: '省份名称',
  })
  provinceName: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'city_code',
    comment: '城市编码',
  })
  cityCode: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'city_name',
    comment: '城市名称',
  })
  cityName: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'district_code',
    comment: '区/县编码',
  })
  districtCode: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'district_name',
    comment: '区/县名称',
  })
  districtName: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'detail_address',
    comment: '详细地址',
  })
  detailAddress: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    name: 'postal_code',
    comment: '邮政编码',
  })
  postalCode: string;

  @Column({
    type: 'tinyint',
    default: 1,
    name: 'is_default',
    comment: '是否默认地址：0-否，1-是',
  })
  isDefault: number;

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
  @OneToOne(() => Merchant, (merchant) => merchant.shippingAddress)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;
}

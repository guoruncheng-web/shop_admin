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
import { SkuSpecName } from '../../sku-spec-names/entities/sku-spec-name.entity';

@Entity('sku_spec_values')
export class SkuSpecValue {
  @PrimaryGeneratedColumn({ comment: '规格值ID' })
  id: number;

  @Column({ name: 'merchant_id', comment: '商户ID' })
  merchantId: number;

  @Column({ name: 'spec_name_id', comment: '规格名称ID' })
  specNameId: number;

  @Column({
    name: 'spec_value',
    length: 100,
    comment: '规格值，如：黑色、XL、纯棉',
  })
  specValue: string;

  @Column({ length: 255, nullable: true, comment: '规格图片，如颜色预览图' })
  image: string;

  @Column({ type: 'int', default: 0, comment: '排序值，数字越小越靠前' })
  sort: number;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;

  @ManyToOne(() => Merchant)
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @ManyToOne(() => SkuSpecName, (specName) => specName.specValues)
  @JoinColumn({ name: 'spec_name_id' })
  specName: SkuSpecName;
}

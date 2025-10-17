import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { Admin } from '../../admin/entities/admin.entity';

@Entity('brands')
@Index(['merchantId', 'name'], { unique: true })
@Index(['merchantId'])
@Index(['status'])
@Index(['isAuth'])
@Index(['isHot'])
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'merchant_id' })
  @Index()
  merchantId: number;

  @ManyToOne(() => Merchant, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant;

  @Column()
  @Index({ unique: true })
  name: string;

  @Column({ name: 'icon_url' })
  iconUrl: string;

  @Column({ name: 'creator_id', nullable: true })
  creatorId?: number;

  @ManyToOne(() => Admin, { nullable: true })
  @JoinColumn({ name: 'creator_id' })
  creator?: Admin;

  @Column({ type: 'json', nullable: true })
  label: string[];

  @Column({ name: 'create_time', type: 'datetime' })
  @CreateDateColumn()
  createTime: Date;

  @Column({ name: 'update_time', type: 'datetime' })
  @UpdateDateColumn()
  updateTime: Date;

  @Column({ type: 'tinyint', default: 1 })
  status: number; // 0: 禁用, 1: 启用

  @Column({ name: 'is_auth', type: 'tinyint', default: 0 })
  isAuth: number; // 0: 未认证, 1: 已认证

  @Column({ name: 'is_hot', type: 'tinyint', default: 0 })
  isHot: number; // 0: 不是热门, 1: 热门
}

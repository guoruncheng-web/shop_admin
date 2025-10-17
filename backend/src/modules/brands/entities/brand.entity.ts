import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, comment: '品牌名称' })
  name: string;

  @Column({ type: 'text', nullable: true, comment: '品牌描述' })
  description: string;

  @Column({ name: 'merchant_id', type: 'int', comment: '商户ID' })
  merchantId: number;

  @Column({ name: 'icon_url', type: 'varchar', length: 255, comment: '品牌icon 必填' })
  iconUrl: string;

  @Column({ name: 'logo', type: 'varchar', length: 255, nullable: true, comment: '品牌logo' })
  logo: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态 0禁用 1启用' })
  status: boolean;

  @Column({ type: 'tinyint', default: 0, comment: '0 未认证 1 已认证' })
  isAuth: boolean;

  @Column({ type: 'tinyint', default: 0, comment: '0 不是热门 1 热门' })
  isHot: boolean;

  @Column({ type: 'json', nullable: true, comment: '品牌标签数组' })
  label: string[];

  @Column({ length: 100, nullable: true, comment: '品牌的创建者' })
  creator: string;

  @Column({ name: 'create_time', type: 'datetime', nullable: true, comment: '品牌的创建时间' })
  createTime: Date;

  @Column({ name: 'update_time', type: 'datetime', nullable: true, comment: '品牌的更新时间' })
  updateTime: Date;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', comment: '更新时间' })
  updatedAt: Date;
}

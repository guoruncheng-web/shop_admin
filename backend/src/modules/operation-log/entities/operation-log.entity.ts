import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Merchant } from '../../merchants/entities/merchant.entity';

@Entity('operation_logs')
@Index(['userId', 'createdAt'])
@Index(['module', 'operation'])
@Index(['createdAt'])
export class OperationLog {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '日志ID' })
  id: number;

  @Column({ type: 'bigint', comment: '用户ID' })
  userId: number;

  @Column({ type: 'varchar', length: 100, comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 100, comment: '模块名称' })
  module: string;

  @Column({ type: 'varchar', length: 100, comment: '操作类型' })
  operation: string;

  @Column({ type: 'varchar', length: 255, comment: '操作描述' })
  description: string;

  @Column({ type: 'varchar', length: 10, comment: '请求方法' })
  method: string;

  @Column({ type: 'varchar', length: 500, comment: '请求路径' })
  path: string;

  @Column({ type: 'text', nullable: true, comment: '请求参数' })
  params: string;

  @Column({ type: 'text', nullable: true, comment: '响应数据' })
  response: string;

  @Column({ type: 'varchar', length: 45, comment: 'IP地址' })
  ip: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '地理位置' })
  location: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '用户代理' })
  userAgent: string;

  @Column({ type: 'int', comment: '响应状态码' })
  statusCode: number;

  @Column({ type: 'int', comment: '执行时间(ms)' })
  executionTime: number;

  @Column({
    type: 'enum',
    enum: ['success', 'failed'],
    default: 'success',
    comment: '操作状态',
  })
  status: 'success' | 'failed';

  @Column({ type: 'text', nullable: true, comment: '错误信息' })
  errorMessage: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '业务标识' })
  businessId: string;

  @Column({
    type: 'bigint',
    name: 'merchant_id',
    nullable: true,
    comment: '所属商户ID',
  })
  merchantId: number | null;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 关联商户信息
  @ManyToOne(() => Merchant, { nullable: true })
  @JoinColumn({ name: 'merchant_id' })
  merchant: Merchant | null;
}

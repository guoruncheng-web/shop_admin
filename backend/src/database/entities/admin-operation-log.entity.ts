import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Admin } from './admin.entity';

@Entity('admin_operation_logs')
export class AdminOperationLog {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '日志ID' })
  id: number;

  @Column({ type: 'bigint', comment: '管理员ID' })
  adminId: number;

  @Column({ type: 'varchar', length: 50, comment: '管理员用户名' })
  username: string;

  @Column({ type: 'varchar', length: 50, comment: '操作模块' })
  module: string;

  @Column({ type: 'varchar', length: 50, comment: '操作类型' })
  operation: string;

  @Column({ type: 'varchar', length: 10, comment: '请求方法' })
  method: string;

  @Column({ type: 'varchar', length: 500, comment: '请求URL' })
  url: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '操作IP' })
  ip?: string;

  @Column({ type: 'text', nullable: true, comment: '用户代理' })
  userAgent?: string;

  @Column({ type: 'text', nullable: true, comment: '请求参数' })
  requestParams?: string;

  @Column({ type: 'text', nullable: true, comment: '响应结果' })
  responseResult?: string;

  @Column({ 
    type: 'tinyint', 
    default: 1, 
    comment: '操作状态：1-成功，0-失败' 
  })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '错误信息' })
  errorMessage?: string;

  @Column({ type: 'int', default: 0, comment: '执行时间(毫秒)' })
  executionTime: number;

  @Column({ 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP', 
    comment: '操作时间' 
  })
  createdAt: Date;

  // 关联管理员
  @ManyToOne(() => Admin, (admin) => admin.operationLogs)
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;
}

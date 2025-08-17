import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Admin } from './admin.entity';

@Entity('admin_operation_logs')
export class AdminOperationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '管理员ID' })
  adminId: number;

  @Column({ length: 100, comment: '操作模块' })
  module: string;

  @Column({ length: 100, comment: '操作动作' })
  action: string;

  @Column({ type: 'text', nullable: true, comment: '操作描述' })
  description: string;

  @Column({ length: 200, nullable: true, comment: '请求URL' })
  url: string;

  @Column({ length: 10, nullable: true, comment: '请求方法' })
  method: string;

  @Column({ type: 'text', nullable: true, comment: '请求参数' })
  params: string;

  @Column({ length: 45, comment: '操作IP地址' })
  ip: string;

  @Column({ length: 500, nullable: true, comment: '用户代理信息' })
  userAgent: string;

  @Column({ type: 'datetime', comment: '操作时间', nullable: true })
  operationTime: Date;

  // 多对一关系：操作日志-管理员
  @ManyToOne(() => Admin, (admin) => admin.operationLogs)
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;
}

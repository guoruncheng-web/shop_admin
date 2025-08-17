import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Admin } from './admin.entity';

@Entity('admin_login_logs')
export class AdminLoginLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '管理员ID' })
  adminId: number;

  @Column({ length: 45, comment: '登录IP地址' })
  loginIp: string;

  @Column({ length: 500, nullable: true, comment: '用户代理信息' })
  userAgent: string;

  @Column({ type: 'tinyint', comment: '登录状态：1-成功，0-失败' })
  status: number;

  @Column({ length: 200, nullable: true, comment: '失败原因' })
  failReason: string;

  @Column({ type: 'datetime', comment: '登录时间', nullable: true })
  loginTime: Date;

  // 多对一关系：登录日志-管理员
  @ManyToOne(() => Admin, (admin) => admin.loginLogs)
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;
}

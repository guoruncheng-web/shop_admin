import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Admin } from './admin.entity';

@Entity('admin_login_logs')
export class AdminLoginLog {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '日志ID' })
  id: number;

  @Column({ type: 'bigint', nullable: true, comment: '管理员ID' })
  adminId?: number;

  @Column({ type: 'varchar', length: 50, comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '登录IP' })
  ip?: string;

  @Column({ type: 'text', nullable: true, comment: '用户代理' })
  userAgent?: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '登录地点' })
  loginLocation?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '浏览器类型' })
  browser?: string;

  @Column({ type: 'varchar', length: 50, nullable: true, comment: '操作系统' })
  os?: string;

  @Column({ type: 'tinyint', comment: '登录状态：0-失败，1-成功' })
  status: number;

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '登录信息' })
  message?: string;

  @Column({ 
    type: 'timestamp', 
    default: () => 'CURRENT_TIMESTAMP', 
    comment: '登录时间' 
  })
  loginTime: Date;

  @Column({ type: 'timestamp', nullable: true, comment: '登出时间' })
  logoutTime?: Date;

  // 关联管理员
  @ManyToOne(() => Admin, (admin) => admin.loginLogs)
  @JoinColumn({ name: 'admin_id' })
  admin?: Admin;
}

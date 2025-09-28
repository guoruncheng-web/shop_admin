import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('user_login_logs')
export class UserLoginLog {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: '日志ID' })
  id: number;

  @Column({ type: 'bigint', comment: '用户ID' })
  userId: number;

  @Column({ type: 'varchar', length: 45, comment: 'IP地址' })
  ip: string;

  @Column({ type: 'varchar', length: 500, nullable: true, comment: '用户代理' })
  userAgent: string;

  @Column({ type: 'varchar', length: 100, nullable: true, comment: '登录地点' })
  location: string;

  @Column({ 
    type: 'enum', 
    enum: ['success', 'failed'],
    default: 'success',
    comment: '登录状态'
  })
  status: 'success' | 'failed';

  @Column({ type: 'varchar', length: 255, nullable: true, comment: '失败原因' })
  failReason: string;

  @CreateDateColumn({ comment: '创建时间' })
  createdAt: Date;

  // 注意：这里不直接关联User实体，因为可能存在循环依赖
  // 如果需要用户信息，通过userId查询
}
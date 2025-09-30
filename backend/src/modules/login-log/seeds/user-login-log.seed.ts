import { DataSource } from 'typeorm';
import { UserLoginLog } from '../entities/user-login-log.entity';

export async function seedUserLoginLogs(dataSource: DataSource) {
  const userLoginLogRepository = dataSource.getRepository(UserLoginLog);

  // 检查是否已有数据
  const existingLogs = await userLoginLogRepository.count();
  if (existingLogs > 0) {
    console.log('用户登录日志数据已存在，跳过种子数据插入');
    return;
  }

  const sampleLogs = [
    {
      userId: 1,
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      location: '北京市',
      status: 'success' as const,
      createdAt: new Date('2024-01-15 09:30:00'),
    },
    {
      userId: 1,
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      location: '上海市',
      status: 'success' as const,
      createdAt: new Date('2024-01-14 14:20:00'),
    },
    {
      userId: 2,
      ip: '10.0.0.50',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      location: '广州市',
      status: 'failed' as const,
      failReason: '密码错误',
      createdAt: new Date('2024-01-13 16:45:00'),
    },
    {
      userId: 2,
      ip: '10.0.0.50',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      location: '广州市',
      status: 'success' as const,
      createdAt: new Date('2024-01-13 16:47:00'),
    },
    {
      userId: 3,
      ip: '172.16.0.25',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      location: '深圳市',
      status: 'success' as const,
      createdAt: new Date('2024-01-12 11:15:00'),
    },
  ];

  await userLoginLogRepository.save(sampleLogs);
  console.log('用户登录日志种子数据插入完成');
}

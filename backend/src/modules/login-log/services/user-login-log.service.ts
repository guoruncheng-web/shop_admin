import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserLoginLog } from '../entities/user-login-log.entity';
import { CreateUserLoginLogDto, QueryUserLoginLogDto } from '../dto/create-login-log.dto';
import { Admin } from '../../../database/entities/admin.entity';

@Injectable()
export class UserLoginLogService {
  constructor(
    @InjectRepository(UserLoginLog)
    private userLoginLogRepository: Repository<UserLoginLog>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  async create(createUserLoginLogDto: CreateUserLoginLogDto): Promise<UserLoginLog> {
    const loginLog = this.userLoginLogRepository.create(createUserLoginLogDto);
    return await this.userLoginLogRepository.save(loginLog);
  }

  async findAll(query: QueryUserLoginLogDto) {
    const { page = 1, pageSize = 20, status, userId, startDate, endDate } = query;
    
    const queryBuilder = this.userLoginLogRepository.createQueryBuilder('loginLog');

    if (status && status !== '' && (status === 'success' || status === 'failed')) {
      queryBuilder.andWhere('loginLog.status = :status', { status });
    }

    if (userId) {
      queryBuilder.andWhere('loginLog.userId = :userId', { userId });
    }

    if (startDate) {
      queryBuilder.andWhere('loginLog.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('loginLog.createdAt <= :endDate', { endDate });
    }

    queryBuilder
      .orderBy('loginLog.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    // 获取所有相关用户信息
    const userIds = [...new Set(items.map(log => log.userId))];
    console.log('查询的用户IDs:', userIds);

    // 使用In查询来获取用户信息
    const users = userIds.length > 0 ? await this.adminRepository.find({
      where: { id: In(userIds) },
      select: ['id', 'username', 'realName', 'email', 'phone', 'avatar', 'status']
    }) : [];

    console.log('查询到的用户信息:', users);
    const userMap = new Map(users.map(user => [user.id, user]));

    // 转换数据格式以匹配前端期望
    const transformedItems = items.map((log) => {
      const user = userMap.get(log.userId);

      // 如果找不到用户信息，记录警告
      if (!user) {
        console.warn(`警告：无法找到用户ID ${log.userId} 的用户信息`);
      }

      return {
        id: log.id,
        userId: log.userId,
        username: user?.username || `用户${log.userId}`,
        loginType: 'password', // 默认密码登录，后续可扩展
        ip: log.ip,
        location: log.location || '-',
        userAgent: log.userAgent || '',
        status: log.status,
        failReason: log.failReason,
        loginTime: log.createdAt.toISOString(),
        logoutTime: null, // 暂时为空，后续可扩展
        sessionId: null, // 暂时为空，后续可扩展
        user: user ? {
          id: user.id,
          username: user.username,
          realName: user.realName || null,
          email: user.email || null,
          phone: user.phone || null,
          avatar: user.avatar || null,
          status: user.status,
        } : {
          id: log.userId,
          username: `用户${log.userId}`,
          realName: '【用户不存在】',
          email: null,
          phone: null,
          avatar: null,
          status: 0,
        },
      };
    });

    return {
      code: 200,
      data: transformedItems,
      meta: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
        totalPages: Math.ceil(total / pageSize),
      },
      msg: '获取成功'
    };
  }

  async findOne(id: number): Promise<UserLoginLog> {
    return await this.userLoginLogRepository.findOne({
      where: { id },
    });
  }

  async remove(id: number): Promise<void> {
    await this.userLoginLogRepository.delete(id);
  }

  async clearOldLogs(days: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    await this.userLoginLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();
  }

  // 简单的位置信息获取
  private getLocationFromIp(ip: string): string {
    // 简单的IP位置判断，实际项目中可以使用第三方IP定位服务
    if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1') {
      return '本地';
    }

    // 判断是否为内网IP
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return '内网';
    }

    // 对于外网IP，可以集成第三方IP定位服务
    // 这里先返回默认值
    return '未知位置';
  }

  // 记录登录日志的便捷方法
  async recordLogin(userId: number, ip: string, userAgent?: string, success: boolean = true, failReason?: string) {
    const location = this.getLocationFromIp(ip);

    const loginLog = {
      userId,
      ip,
      userAgent,
      location,
      status: success ? 'success' as const : 'failed' as const,
      failReason: success ? null : failReason,
    };

    console.log('记录登录日志:', loginLog);
    return await this.create(loginLog);
  }
}
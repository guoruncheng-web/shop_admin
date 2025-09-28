import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLoginLog } from '../entities/user-login-log.entity';
import { CreateUserLoginLogDto, QueryUserLoginLogDto } from '../dto/create-login-log.dto';

@Injectable()
export class UserLoginLogService {
  constructor(
    @InjectRepository(UserLoginLog)
    private userLoginLogRepository: Repository<UserLoginLog>,
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

    // 转换数据格式以匹配前端期望
    const transformedItems = items.map((log) => {
      return {
        id: log.id,
        userId: log.userId,
        username: `用户${log.userId}`, // 暂时使用用户ID，后续可以优化
        loginType: 'password', // 默认密码登录，后续可扩展
        ip: log.ip,
        location: log.location || '-',
        userAgent: log.userAgent || '',
        status: log.status,
        failReason: log.failReason,
        loginTime: log.createdAt.toISOString(),
        logoutTime: null, // 暂时为空，后续可扩展
        sessionId: null, // 暂时为空，后续可扩展
        user: {
          id: log.userId,
          username: `用户${log.userId}`,
          realName: null,
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

  // 记录登录日志的便捷方法
  async recordLogin(userId: number, ip: string, userAgent?: string, success: boolean = true, failReason?: string) {
    const loginLog = {
      userId,
      ip,
      userAgent,
      status: success ? 'success' as const : 'failed' as const,
      failReason: success ? null : failReason,
    };
    
    return await this.create(loginLog);
  }
}
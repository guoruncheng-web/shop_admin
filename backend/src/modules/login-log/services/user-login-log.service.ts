import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserLoginLog } from '../entities/user-login-log.entity';
import {
  CreateUserLoginLogDto,
  QueryUserLoginLogDto,
} from '../dto/create-login-log.dto';
import { Admin } from '../../../database/entities/admin.entity';
import { Merchant } from '../../merchants/entities/merchant.entity';
import { IpLocationService } from './ip-location.service';

@Injectable()
export class UserLoginLogService {
  constructor(
    @InjectRepository(UserLoginLog)
    private userLoginLogRepository: Repository<UserLoginLog>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
    private ipLocationService: IpLocationService,
  ) {}

  async create(
    createUserLoginLogDto: CreateUserLoginLogDto,
  ): Promise<UserLoginLog> {
    const loginLog = this.userLoginLogRepository.create(createUserLoginLogDto);
    return await this.userLoginLogRepository.save(loginLog);
  }

  async findAll(query: QueryUserLoginLogDto) {
    const {
      page = 1,
      pageSize = 20,
      status,
      userId,
      username,
      merchantId,
      ip,
      startDate,
      endDate,
      startTime,
      endTime,
    } = query;

    const queryBuilder = this.userLoginLogRepository
      .createQueryBuilder('loginLog')
      .leftJoinAndSelect('loginLog.merchant', 'merchant');

    if (
      status &&
      status !== '' &&
      (status === 'success' || status === 'failed')
    ) {
      queryBuilder.andWhere('loginLog.status = :status', { status });
    }

    if (userId) {
      queryBuilder.andWhere('loginLog.userId = :userId', { userId });
    }

    if (merchantId) {
      queryBuilder.andWhere('loginLog.merchantId = :merchantId', {
        merchantId,
      });
    }

    if (username) {
      queryBuilder.andWhere('loginLog.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    if (ip) {
      queryBuilder.andWhere('loginLog.ip LIKE :ip', {
        ip: `%${ip}%`,
      });
    }

    // 优先使用startTime/endTime，如果没有则使用startDate/endDate
    if (startTime) {
      queryBuilder.andWhere('loginLog.createdAt >= :startTime', { startTime });
    } else if (startDate) {
      queryBuilder.andWhere('loginLog.createdAt >= :startDate', { startDate });
    }

    if (endTime) {
      queryBuilder.andWhere('loginLog.createdAt <= :endTime', { endTime });
    } else if (endDate) {
      queryBuilder.andWhere('loginLog.createdAt <= :endDate', { endDate });
    }

    queryBuilder
      .orderBy('loginLog.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    // 获取所有相关用户信息
    const userIds = [...new Set(items.map((log) => log.userId))];
    console.log('查询的用户IDs:', userIds);

    // 使用In查询来获取用户信息
    const users =
      userIds.length > 0
        ? await this.adminRepository.find({
            where: { id: In(userIds) },
            relations: ['merchant'],
          })
        : [];

    console.log('查询到的用户信息:', users);
    const userMap = new Map(users.map((user) => [user.id, user]));

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
        merchant: log.merchant || user?.merchant || null,
        user: user
          ? {
              id: user.id,
              username: user.username,
              realName: user.realName || null,
              email: user.email || null,
              phone: user.phone || null,
              avatar: user.avatar || null,
              status: user.status,
              merchant: user.merchant || null,
            }
          : {
              id: log.userId,
              username: `用户${log.userId}`,
              realName: '【用户不存在】',
              email: null,
              phone: null,
              avatar: null,
              status: 0,
              merchant: null,
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
      msg: '获取成功',
    };
  }

  async findOne(id: number) {
    const log = await this.userLoginLogRepository.findOne({
      where: { id },
      relations: ['merchant'],
    });

    if (!log) {
      return null;
    }

    // 获取用户信息
    const user = await this.adminRepository.findOne({
      where: { id: log.userId },
      relations: ['merchant'],
    });

    return {
      id: log.id,
      userId: log.userId,
      username: user?.username || `用户${log.userId}`,
      loginType: 'password',
      ip: log.ip,
      location: log.location || '-',
      userAgent: log.userAgent || '',
      status: log.status,
      failReason: log.failReason,
      loginTime: log.createdAt.toISOString(),
      logoutTime: null,
      sessionId: null,
      merchant: log.merchant || user?.merchant || null,
      merchantId: log.merchantId,
      user: user
        ? {
            id: user.id,
            username: user.username,
            realName: user.realName || null,
            email: user.email || null,
            phone: user.phone || null,
            avatar: user.avatar || null,
            status: user.status,
            merchant: user.merchant || null,
          }
        : {
            id: log.userId,
            username: `用户${log.userId}`,
            realName: '【用户不存在】',
            email: null,
            phone: null,
            avatar: null,
            status: 0,
            merchant: null,
          },
    };
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

  // 改进的位置信息获取
  private getLocationFromIp(ip: string): string {
    // 处理本地地址
    if (
      ip === '127.0.0.1' ||
      ip === 'localhost' ||
      ip === '::1' ||
      ip === '0:0:0:0:0:0:0:1'
    ) {
      return '本地';
    }

    // 处理空或无效IP
    if (!ip || ip === '-' || ip === 'unknown') {
      return '-';
    }

    // 判断IPv4内网地址
    if (this.isPrivateIPv4(ip)) {
      return '内网';
    }

    // 判断IPv6内网地址
    if (this.isPrivateIPv6(ip)) {
      return '内网IPv6';
    }

    // 对于外网IP，这里可以集成第三方IP定位服务
    // 例如：百度地图API、高德地图API、ip-api.com等
    // 现在先返回基本信息
    if (this.isIPv6(ip)) {
      return 'IPv6地址';
    }

    return '外网';
  }

  // 判断是否为IPv4私有地址
  private isPrivateIPv4(ip: string): boolean {
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = ip.match(ipv4Regex);

    if (!match) return false;

    const octets = match.slice(1, 5).map(Number);

    // 检查是否为有效的IPv4地址
    if (octets.some((octet) => octet > 255)) return false;

    // 私有地址范围
    return (
      // 10.0.0.0/8
      octets[0] === 10 ||
      // 172.16.0.0/12
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
      // 192.168.0.0/16
      (octets[0] === 192 && octets[1] === 168) ||
      // 169.254.0.0/16 (链路本地地址)
      (octets[0] === 169 && octets[1] === 254)
    );
  }

  // 判断是否为IPv6私有地址
  private isPrivateIPv6(ip: string): boolean {
    if (!this.isIPv6(ip)) return false;

    const normalized = this.normalizeIPv6(ip);

    // IPv6私有地址范围
    return (
      normalized.startsWith('fc') || // fc00::/7 - 唯一本地地址
      normalized.startsWith('fd') || // fd00::/8 - 唯一本地地址
      normalized.startsWith('fe80:') || // fe80::/10 - 链路本地地址
      normalized === '::1' // 环回地址
    );
  }

  // 判断是否为IPv6地址
  private isIPv6(ip: string): boolean {
    return ip.includes(':');
  }

  // 规范化IPv6地址格式
  private normalizeIPv6(ip: string): string {
    return ip.toLowerCase().replace(/^::ffff:/, '');
  }

  // 记录登录日志的便捷方法
  async recordLogin(
    userId: number | null,
    ip: string,
    userAgent?: string,
    success: boolean = true,
    failReason?: string,
    merchantId?: number | null,
  ) {
    // 异步获取位置信息，但不阻塞登录流程
    let location = this.getLocationFromIp(ip);

    try {
      // 尝试获取更详细的位置信息（异步）
      const locationInfo = await this.ipLocationService.getLocationInfo(ip);
      if (locationInfo.location && locationInfo.location !== '外网') {
        location = locationInfo.location;
      }
    } catch (error) {
      console.warn(`获取IP位置信息失败 (${ip}):`, error.message);
      // 使用基础位置信息作为备用
    }

    const loginLog = {
      userId,
      ip,
      userAgent,
      location,
      merchantId,
      status: success ? ('success' as const) : ('failed' as const),
      failReason: success ? null : failReason,
    };

    console.log('📝 记录登录日志:', {
      ...loginLog,
      userAgent:
        loginLog.userAgent?.substring(0, 50) +
        (loginLog.userAgent?.length > 50 ? '...' : ''),
    });

    return await this.create(loginLog);
  }
}

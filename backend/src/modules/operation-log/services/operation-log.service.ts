import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { OperationLog } from '../entities/operation-log.entity';
import {
  CreateOperationLogDto,
  QueryOperationLogDto,
  OperationLogResponseDto,
} from '../dto/operation-log.dto';
import { Admin } from '../../../database/entities/admin.entity';
import { Merchant } from '../../merchants/entities/merchant.entity';

@Injectable()
export class OperationLogService {
  constructor(
    @InjectRepository(OperationLog)
    private operationLogRepository: Repository<OperationLog>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    @InjectRepository(Merchant)
    private merchantRepository: Repository<Merchant>,
  ) {}

  async create(
    createOperationLogDto: CreateOperationLogDto,
  ): Promise<OperationLog> {
    const operationLog = this.operationLogRepository.create(
      createOperationLogDto,
    );
    return await this.operationLogRepository.save(operationLog);
  }

  async findAll(query: QueryOperationLogDto) {
    const {
      page = 1,
      pageSize = 20,
      username,
      module,
      operation,
      status,
      ip,
      startTime,
      endTime,
      businessId,
      merchantId,
    } = query;

    const queryBuilder =
      this.operationLogRepository.createQueryBuilder('operationLog')
        .leftJoinAndSelect('operationLog.merchant', 'merchant');

    // 用户名筛选
    if (username && username !== '') {
      queryBuilder.andWhere('operationLog.username LIKE :username', {
        username: `%${username}%`,
      });
    }

    // 模块筛选
    if (module && module !== '') {
      queryBuilder.andWhere('operationLog.module = :module', { module });
    }

    // 操作类型筛选
    if (operation && operation !== '') {
      queryBuilder.andWhere('operationLog.operation = :operation', {
        operation,
      });
    }

    // 状态筛选
    if (status && (status === 'success' || status === 'failed')) {
      queryBuilder.andWhere('operationLog.status = :status', { status });
    }

    // IP地址筛选
    if (ip && ip !== '') {
      queryBuilder.andWhere('operationLog.ip LIKE :ip', { ip: `%${ip}%` });
    }

    // 业务标识筛选
    if (businessId && businessId !== '') {
      queryBuilder.andWhere('operationLog.businessId = :businessId', {
        businessId,
      });
    }

    // 商户ID筛选
    if (merchantId) {
      queryBuilder.andWhere('operationLog.merchantId = :merchantId', {
        merchantId,
      });
    }

    // 时间范围筛选
    if (startTime && endTime) {
      queryBuilder.andWhere(
        'operationLog.createdAt BETWEEN :startTime AND :endTime',
        {
          startTime,
          endTime,
        },
      );
    } else if (startTime) {
      queryBuilder.andWhere('operationLog.createdAt >= :startTime', {
        startTime,
      });
    } else if (endTime) {
      queryBuilder.andWhere('operationLog.createdAt <= :endTime', { endTime });
    }

    queryBuilder
      .orderBy('operationLog.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await queryBuilder.getManyAndCount();

    // 获取所有相关用户信息
    const userIds = [...new Set(items.map((log) => log.userId))];
    const users =
      userIds.length > 0
        ? await this.adminRepository.find({
            where: { id: In(userIds) },
            relations: ['merchant'],
          })
        : [];

    const userMap = new Map(users.map((user) => [user.id, user]));

    // 获取所有相关商户信息
    const merchantIds = [...new Set(items.map((log) => log.merchantId).filter(Boolean))];
    const merchants =
      merchantIds.length > 0
        ? await this.merchantRepository.find({
            where: { id: In(merchantIds) },
            select: ['id', 'merchantCode', 'merchantName', 'merchantType'],
          })
        : [];

    const merchantMap = new Map(merchants.map((merchant) => [merchant.id, merchant]));

    // 转换数据格式
    const transformedItems: OperationLogResponseDto[] = items.map((log) => {
      const user = userMap.get(log.userId);

      return {
        ...log,
        user: user
          ? {
              id: user.id,
              username: user.username,
              realName: user.realName || null,
              avatar: user.avatar || null,
            }
          : {
              id: log.userId,
              username: log.username,
              realName: '【用户不存在】',
              avatar: null,
            },
        merchant: log.merchantId ? merchantMap.get(log.merchantId) || {
          id: log.merchantId,
          merchantCode: 'UNKNOWN',
          merchantName: '未知商户',
          merchantType: 2,
        } : undefined,
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

  async findOne(id: number): Promise<OperationLogResponseDto | null> {
    const operationLog = await this.operationLogRepository.findOne({
      where: { id },
      relations: ['merchant'],
    });

    if (!operationLog) {
      return null;
    }

    // 获取用户信息
    const user = await this.adminRepository.findOne({
      where: { id: operationLog.userId },
      select: ['id', 'username', 'realName', 'avatar'],
    });

    return {
      ...operationLog,
      user: user
        ? {
            id: user.id,
            username: user.username,
            realName: user.realName || null,
            avatar: user.avatar || null,
          }
        : {
            id: operationLog.userId,
            username: operationLog.username,
            realName: '【用户不存在】',
            avatar: null,
          },
      merchant: operationLog.merchant ? {
        id: operationLog.merchant.id,
        merchantCode: operationLog.merchant.merchantCode,
        merchantName: operationLog.merchant.merchantName,
        merchantType: operationLog.merchant.merchantType,
      } : undefined,
    };
  }

  async remove(id: number): Promise<void> {
    await this.operationLogRepository.delete(id);
  }

  async batchRemove(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.operationLogRepository.delete(ids);
  }

  async clearOldLogs(days: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await this.operationLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  async clearAllLogs(): Promise<number> {
    const count = await this.operationLogRepository.count();
    await this.operationLogRepository.clear();
    return count;
  }

  // 统计相关方法
  async getStatistics(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 总操作数
    const totalOperations = await this.operationLogRepository.count({
      where: {
        createdAt: Between(startDate, new Date()),
      },
    });

    // 成功操作数
    const successOperations = await this.operationLogRepository.count({
      where: {
        status: 'success',
        createdAt: Between(startDate, new Date()),
      },
    });

    // 失败操作数
    const failedOperations = totalOperations - successOperations;

    // 按模块统计
    const moduleStats = await this.operationLogRepository
      .createQueryBuilder('log')
      .select('log.module', 'module')
      .addSelect('COUNT(*)', 'count')
      .where('log.createdAt >= :startDate', { startDate })
      .groupBy('log.module')
      .orderBy('count', 'DESC')
      .getRawMany();

    // 按操作类型统计
    const operationStats = await this.operationLogRepository
      .createQueryBuilder('log')
      .select('log.operation', 'operation')
      .addSelect('COUNT(*)', 'count')
      .where('log.createdAt >= :startDate', { startDate })
      .groupBy('log.operation')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // 活跃用户统计
    const activeUsers = await this.operationLogRepository
      .createQueryBuilder('log')
      .select('log.username', 'username')
      .addSelect('COUNT(*)', 'count')
      .where('log.createdAt >= :startDate', { startDate })
      .groupBy('log.username')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // 平均执行时间
    const avgExecutionTime = await this.operationLogRepository
      .createQueryBuilder('log')
      .select('AVG(log.executionTime)', 'avgTime')
      .where('log.createdAt >= :startDate', { startDate })
      .getRawOne();

    return {
      code: 200,
      data: {
        totalOperations,
        successOperations,
        failedOperations,
        successRate:
          totalOperations > 0 ? (successOperations / totalOperations) * 100 : 0,
        avgExecutionTime: parseFloat(avgExecutionTime?.avgTime || '0'),
        moduleStats: moduleStats.map((item) => ({
          module: item.module,
          count: parseInt(item.count),
        })),
        operationStats: operationStats.map((item) => ({
          operation: item.operation,
          count: parseInt(item.count),
        })),
        activeUsers: activeUsers.map((item) => ({
          username: item.username,
          count: parseInt(item.count),
        })),
      },
      msg: '获取成功',
    };
  }

  // 获取模块列表
  async getModules(): Promise<string[]> {
    const modules = await this.operationLogRepository
      .createQueryBuilder('log')
      .select('DISTINCT log.module', 'module')
      .orderBy('log.module', 'ASC')
      .getRawMany();

    return modules.map((item) => item.module);
  }

  // 获取操作类型列表
  async getOperations(module?: string): Promise<string[]> {
    const queryBuilder = this.operationLogRepository
      .createQueryBuilder('log')
      .select('DISTINCT log.operation', 'operation');

    if (module) {
      queryBuilder.where('log.module = :module', { module });
    }

    const operations = await queryBuilder
      .orderBy('log.operation', 'ASC')
      .getRawMany();

    return operations.map((item) => item.operation);
  }
}

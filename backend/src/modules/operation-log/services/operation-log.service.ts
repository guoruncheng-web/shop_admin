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
    console.log('📝 操作日志服务 - 收到的创建数据:', {
      ...createOperationLogDto,
      merchantId: createOperationLogDto.merchantId,
    });

    // 确保所有必填字段都有值
    const logData = {
      ...createOperationLogDto,
      statusCode: createOperationLogDto.statusCode || 200,
      executionTime: createOperationLogDto.executionTime || 0,
      status: createOperationLogDto.status || 'success',
    };

    console.log('📝 操作日志服务 - 处理后的创建数据:', {
      ...logData,
      merchantId: logData.merchantId,
    });

    const operationLog = this.operationLogRepository.create(logData);

    console.log('📝 操作日志服务 - 创建的实体对象:', {
      ...operationLog,
      merchantId: operationLog.merchantId,
    });

    try {
      const savedLog = await this.operationLogRepository.save(operationLog);

      console.log('📝 操作日志服务 - 保存后的日志:', {
        id: savedLog.id,
        merchantId: savedLog.merchantId,
      });

      return savedLog;
    } catch (error) {
      console.error('📝 操作日志服务 - 保存失败:', error);
      throw error;
    }
  }

  // added: compatibility helper for service-layer logging
  async logOperation(
    currentUser: { userId: number; merchantId: number; username: string },
    module: string,
    businessId: number | string | null,
    operation: string,
    description: string,
    manager?: { save: (entity: unknown) => Promise<unknown> },
  ): Promise<void> {
    const payload: CreateOperationLogDto = {
      userId: currentUser.userId,
      username: currentUser.username,
      module,
      operation,
      description,
      method: 'SERVICE',
      path: 'brands.service',
      params: businessId ? JSON.stringify({ businessId }) : undefined,
      response: undefined,
      ip: '127.0.0.1',
      location: undefined,
      userAgent: 'internal',
      statusCode: 200,
      executionTime: 0,
      status: 'success',
      errorMessage: undefined,
      businessId: businessId ? String(businessId) : undefined,
      merchantId: currentUser.merchantId,
    };

    if (manager) {
      const entity = this.operationLogRepository.create(payload);
      await manager.save(entity);
    } else {
      await this.create(payload);
    }
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
      merchantName,
    } = query;

    const queryBuilder = this.operationLogRepository
      .createQueryBuilder('operationLog')
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

    // 商户名称筛选
    if (merchantName && merchantName !== '') {
      queryBuilder.andWhere('merchant.merchantName LIKE :merchantName', {
        merchantName: `%${merchantName}%`,
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
    const merchantIds = [
      ...new Set(items.map((log) => log.merchantId).filter(Boolean)),
    ];
    const merchants =
      merchantIds.length > 0
        ? await this.merchantRepository.find({
            where: { id: In(merchantIds) },
            select: ['id', 'merchantCode', 'merchantName', 'merchantType'],
          })
        : [];

    const merchantMap = new Map(
      merchants.map((merchant) => [merchant.id, merchant]),
    );

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
        merchant: log.merchantId
          ? merchantMap.get(log.merchantId) || {
              id: log.merchantId,
              merchantCode: 'UNKNOWN',
              merchantName: '未知商户',
              merchantType: 2,
            }
          : undefined,
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
      merchant: operationLog.merchant
        ? {
            id: operationLog.merchant.id,
            merchantCode: operationLog.merchant.merchantCode,
            merchantName: operationLog.merchant.merchantName,
            merchantType: operationLog.merchant.merchantType,
          }
        : undefined,
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const avgExecutionTimeResult = await this.operationLogRepository
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

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
        avgExecutionTime: parseFloat(avgExecutionTimeResult?.avgTime || '0'),
        moduleStats: moduleStats.map((item) => ({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
          module: item.module,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          count: parseInt(item.count),
        })),
        operationStats: operationStats.map((item) => ({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
          operation: item.operation,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          count: parseInt(item.count),
        })),
        activeUsers: activeUsers.map((item) => ({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
          username: item.username,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return operations.map((item) => item.operation);
  }
}

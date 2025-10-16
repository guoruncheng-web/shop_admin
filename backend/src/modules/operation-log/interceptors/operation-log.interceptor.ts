import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { OperationLogService } from '../services/operation-log.service';
import { IpLocationService } from '../../login-log/services/ip-location.service';
import {
  OPERATION_LOG_KEY,
  OperationLogOptions,
} from '../decorators/operation-log.decorator';

interface CustomRequest extends Request {
  user?: {
    userId?: number;
    id?: number;
    username?: string;
    sub?: number;
    merchantId?: number;
  };
  startTime?: number;
}

@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly operationLogService: OperationLogService,
    private readonly ipLocationService: IpLocationService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const logOptions = this.reflector.get<OperationLogOptions>(
      OPERATION_LOG_KEY,
      context.getHandler(),
    );

    if (!logOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<CustomRequest>();
    const response = context.switchToHttp().getResponse<Response>();

    // 记录开始时间
    const startTime = Date.now();
    request.startTime = startTime;

    // 提取用户信息
    const user = request.user;
    console.log('🔍 操作日志拦截器 - 请求对象用户信息:', user);

    if (!user) {
      return next.handle();
    }

    const userId = user.userId || user.id || user.sub;
    const username = user.username || `user_${userId}`;

    console.log('🔍 操作日志拦截器 - 提取的用户信息:', {
      userId,
      username,
      merchantId: user.merchantId,
      userKeys: Object.keys(user || {}),
    });

    // 提取IP地址
    const ip = this.extractClientIp(request);

    return next.handle().pipe(
      tap((responseData) => {
        void this.logOperation(
          request,
          response,
          logOptions,
          responseData,
          startTime,
          userId,
          username,
          ip,
          'success',
          user,
        );
      }),
      catchError((error) => {
        void this.logOperation(
          request,
          response,
          logOptions,
          null,
          startTime,
          userId,
          username,
          ip,
          'failed',
          error,
          user,
        );
        throw error;
      }),
    );
  }

  private async logOperation(
    request: CustomRequest,
    response: Response,
    logOptions: OperationLogOptions,
    responseData: any,
    startTime: number,
    userId: number,
    username: string,
    ip: string,
    status: 'success' | 'failed',
    error?: any,
    user?: CustomRequest['user'],
  ) {
    try {
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // 获取位置信息
      let location = '本地';
      try {
        const locationInfo = await this.ipLocationService.getLocationInfo(ip);
        location = locationInfo.location || '未知';
      } catch (locationError) {
        console.warn(
          '获取IP位置信息失败:',
          locationError instanceof Error
            ? locationError.message
            : String(locationError),
        );
      }

      // 提取业务ID
      let businessId: string | undefined;
      if (logOptions.businessIdField) {
        businessId = this.extractBusinessId(
          request,
          logOptions.businessIdField,
        );
      }

      // 提取商户ID
      let merchantId: number | null = null;
      if (user && user.merchantId) {
        merchantId = user.merchantId;
        console.log('🔍 操作日志 - 提取到商户ID:', merchantId);
      } else {
        console.log('🔍 操作日志 - 未找到商户ID, 用户信息:', user);
      }

      // 准备参数数据
      let params: string | undefined;
      if (logOptions.includeParams !== false) {
        params = this.formatParams(request);
      }

      // 准备响应数据
      let responseStr: string | undefined;
      if (logOptions.includeResponse && status === 'success') {
        responseStr = this.formatResponse(responseData);
      }
      // 创建操作日志
      const logData = {
        userId,
        username,
        module: logOptions.module,
        operation: logOptions.operation,
        description: logOptions.description,
        method: request.method,
        path: request.originalUrl || request.url,
        params,
        response: responseStr,
        ip,
        location,
        userAgent: request.headers['user-agent'] || '',
        statusCode: response.statusCode || 200, // 确保statusCode有默认值
        executionTime,
        status,
        errorMessage: error ? this.formatError(error) : undefined,
        businessId,
        merchantId,
      };

      console.log('📝 操作日志 - 即将创建的日志数据:', {
        ...logData,
        merchantId: logData.merchantId,
        userMerchantId: user?.merchantId,
        statusCode: logData.statusCode,
      });

      await this.operationLogService.create(logData);
    } catch (logError) {
      console.error('记录操作日志失败:', logError);
    }
  }

  private extractClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'] as string;
    const realIp = request.headers['x-real-ip'] as string;
    const clientIp = request.headers['x-client-ip'] as string;

    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    return realIp || clientIp || request.ip || '127.0.0.1';
  }

  private extractBusinessId(
    request: Request,
    fieldName: string,
  ): string | undefined {
    // 优先从路径参数中提取
    if (request.params && request.params[fieldName]) {
      return String(request.params[fieldName]);
    }

    // 从查询参数中提取
    if (request.query && request.query[fieldName]) {
      const value = request.query[fieldName];
      return typeof value === 'string' ? value : JSON.stringify(value);
    }

    // 从请求体中提取
    if (request.body && (request.body as Record<string, unknown>)[fieldName]) {
      const value = (request.body as Record<string, unknown>)[fieldName];
      return typeof value === 'string' ? value : JSON.stringify(value);
    }

    return undefined;
  }

  private formatParams(request: Request): string {
    const params: Record<string, unknown> = {};

    // 添加路径参数
    if (request.params && Object.keys(request.params).length > 0) {
      params.params = request.params;
    }

    // 添加查询参数
    if (request.query && Object.keys(request.query).length > 0) {
      params.query = request.query;
    }

    // 添加请求体（过滤敏感信息）
    if (request.body && Object.keys(request.body).length > 0) {
      params.body = this.filterSensitiveData(request.body);
    }

    return Object.keys(params).length > 0 ? JSON.stringify(params) : undefined;
  }

  private formatResponse(responseData: any): string {
    if (!responseData) return undefined;

    try {
      // 限制响应数据大小，避免日志过大
      const responseStr = JSON.stringify(responseData);
      if (responseStr.length > 5000) {
        return responseStr.substring(0, 5000) + '...(truncated)';
      }
      return responseStr;
    } catch {
      return '[响应数据格式化失败]';
    }
  }

  private formatError(error: any): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}`;
    }
    return String(error);
  }

  private filterSensitiveData(data: unknown): unknown {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [
      'password',
      'pwd',
      'token',
      'secret',
      'key',
      'authorization',
      'credit_card',
      'ssn',
      'phone',
      'email',
    ];

    const filtered = { ...(data as Record<string, unknown>) };

    for (const field of sensitiveFields) {
      if ((filtered as Record<string, unknown>)[field]) {
        (filtered as Record<string, unknown>)[field] = '***';
      }
    }

    return filtered;
  }
}

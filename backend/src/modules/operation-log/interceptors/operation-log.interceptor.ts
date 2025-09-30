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
    if (!user) {
      return next.handle();
    }

    const userId = user.userId || user.id || user.sub;
    const username = user.username || `user_${userId}`;

    // 提取IP地址
    const ip = this.extractClientIp(request);

    return next.handle().pipe(
      tap((responseData) => {
        this.logOperation(
          request,
          response,
          logOptions,
          responseData,
          startTime,
          userId,
          username,
          ip,
          'success',
        );
      }),
      catchError((error) => {
        this.logOperation(
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
        console.warn('获取IP位置信息失败:', locationError.message);
      }

      // 提取业务ID
      let businessId: string | undefined;
      if (logOptions.businessIdField) {
        businessId = this.extractBusinessId(
          request,
          logOptions.businessIdField,
        );
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
      await this.operationLogService.create({
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
        statusCode: response.statusCode,
        executionTime,
        status,
        errorMessage: error ? this.formatError(error) : undefined,
        businessId,
      });
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
      return String(request.query[fieldName]);
    }

    // 从请求体中提取
    if (request.body && request.body[fieldName]) {
      return String(request.body[fieldName]);
    }

    return undefined;
  }

  private formatParams(request: Request): string {
    const params: any = {};

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
    } catch (error) {
      return '[响应数据格式化失败]';
    }
  }

  private formatError(error: any): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}`;
    }
    return String(error);
  }

  private filterSensitiveData(data: any): any {
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

    const filtered = { ...data };

    for (const field of sensitiveFields) {
      if (filtered[field]) {
        filtered[field] = '***';
      }
    }

    return filtered;
  }
}

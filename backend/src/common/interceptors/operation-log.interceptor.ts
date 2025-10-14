import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { TYPES_KEY, TypesOptions } from '../../auth/decorators/types.decorator';
import { Reflector } from '@nestjs/core';
import { OperationLogService } from '../../modules/operation-log/services/operation-log.service';

interface AuthenticatedRequest extends Request {
  user?: {
    userId?: number;
    id?: number;
    username?: string;
    merchantId?: number;
  };
  permission?: TypesOptions;
  userPermissions?: string[];
  merchantId?: number;
}

@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(OperationLogInterceptor.name);

  constructor(
    private reflector: Reflector,
    private operationLogService: OperationLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse<Response>();

    // 获取装饰器设置的权限配置
    const typesOptions = this.reflector.get<TypesOptions>(
      TYPES_KEY,
      context.getHandler(),
    );

    // 如果没有设置权限配置，不记录操作日志
    if (!typesOptions) {
      return next.handle();
    }

    const startTime = Date.now();
    const method = request.method;
    const path = request.path;
    const ip = this.getClientIp(request);
    const userAgent = request.headers['user-agent'] || '';

    // 获取用户信息
    const user = request.user;
    const userId = user?.userId || user?.id;
    const username = user?.username || 'unknown';
    const merchantId = user?.merchantId || request.merchantId || null;

    return next.handle().pipe(
      tap((responseData) => {
        // 异步记录操作日志
        this.recordLog({
          userId: Number(userId),
          username,
          merchantId,
          typesOptions,
          method,
          path,
          request,
          response,
          ip,
          userAgent,
          startTime,
          responseData,
          status: 'success',
          error: null,
        });
      }),
      catchError((error) => {
        // 异步记录错误操作日志
        this.recordLog({
          userId: Number(userId),
          username,
          merchantId,
          typesOptions,
          method,
          path,
          request,
          response,
          ip,
          userAgent,
          startTime,
          responseData: null,
          status: 'failed',
          error,
        });

        throw error;
      }),
    );
  }

  private recordLog(params: {
    userId: number;
    username: string;
    merchantId: number | null;
    typesOptions: TypesOptions;
    method: string;
    path: string;
    request: AuthenticatedRequest;
    response: Response;
    ip: string;
    userAgent: string;
    startTime: number;
    responseData: any;
    status: 'success' | 'failed';
    error: any;
  }): void {
    // 异步记录，不阻塞主流程
    setImmediate(async () => {
      try {
        const endTime = Date.now();
        const executionTime = endTime - params.startTime;

        // 准备操作日志数据
        const logData: Record<string, any> = {
          userId: params.userId,
          username: params.username,
          module: params.typesOptions.module || this.extractModuleFromPath(params.path),
          operation: params.typesOptions.operation || params.method.toLowerCase(),
          description: params.typesOptions.name,
          method: params.method,
          path: params.path,
          ip: params.ip,
          userAgent: params.userAgent,
          executionTime,
          status: params.status,
          merchantId: params.merchantId,
        };

        // 处理参数
        if (params.typesOptions.includeParams !== false) {
          const requestParams = params.request.body || params.request.query;
          logData.params = JSON.stringify(this.sanitizeParams(requestParams));
        }

        // 处理响应
        if (params.typesOptions.includeResponse && params.responseData && params.status === 'success') {
          logData.response = JSON.stringify(this.sanitizeResponse(params.responseData));
          logData.statusCode = params.response.statusCode;
        } else if (params.status === 'failed') {
          logData.statusCode = this.getErrorStatus(params.error);
          logData.errorMessage = this.getErrorMessage(params.error);
        }

        // 提取业务ID
        logData.businessId = this.extractBusinessId(params.request);

        // 记录操作日志
        await this.operationLogService.create(logData as any);
      } catch (error) {
        this.logger.error('操作日志记录失败:', error);
      }
    });
  }

  /**
   * 获取客户端真实IP
   */
  private getClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'] as string;
    const realIp = request.headers['x-real-ip'] as string;
    const clientIp = request.headers['x-client-ip'] as string;

    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }

    if (realIp) {
      return realIp;
    }

    if (clientIp) {
      return clientIp;
    }

    return request.ip || '127.0.0.1';
  }

  /**
   * 从路径中提取模块名称
   */
  private extractModuleFromPath(path: string): string {
    const pathParts = path.split('/').filter((part) => part);
    return pathParts[0] || 'unknown';
  }

  /**
   * 提取业务ID
   */
  private extractBusinessId(request: Request): string {
    const urlParams = request.params as any;
    const bodyParams = request.body as any;
    const id = urlParams?.id || bodyParams?.id;
    return String(id || '');
  }

  /**
   * 清理敏感参数
   */
  private sanitizeParams(params: any): any {
    if (!params || typeof params !== 'object') {
      return params;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    const sanitized = { ...params };

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***';
      }
    }

    return sanitized;
  }

  /**
   * 清理响应数据
   */
  private sanitizeResponse(response: any): any {
    if (!response || typeof response !== 'object') {
      return response;
    }

    // 如果响应数据过大，只记录摘要
    const responseStr = JSON.stringify(response);
    if (responseStr.length > 1000) {
      return {
        __truncated: true,
        __length: responseStr.length,
        __type: Array.isArray(response) ? 'array' : 'object',
      };
    }

    return response;
  }

  /**
   * 获取错误状态码
   */
  private getErrorStatus(error: any): number {
    return error?.status || error?.statusCode || 500;
  }

  /**
   * 获取错误消息
   */
  private getErrorMessage(error: any): string {
    return error?.message || error?.description || '操作失败';
  }
}
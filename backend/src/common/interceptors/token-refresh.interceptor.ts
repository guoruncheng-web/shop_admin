import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenRefreshInterceptor implements NestInterceptor {
  constructor(
    @Inject(JwtService) private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // 获取当前token
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next.handle();
    }

    const token = authHeader.substring(7);

    try {
      // 解码token（不验证签名，只获取payload）
      const decoded = this.jwtService.decode(token);
      if (!decoded || !decoded.exp) {
        return next.handle();
      }

      const now = Math.floor(Date.now() / 1000);
      const tokenExp = decoded.exp;
      const refreshThreshold = 24 * 60 * 60; // 24小时（秒）

      // 如果token在24小时内过期，则刷新
      if (tokenExp - now < refreshThreshold && tokenExp > now) {
        // 生成新的token
        const newPayload = {
          sub: decoded.sub,
          username: decoded.username,
          roles: decoded.roles,
          permissions: decoded.permissions,
          iat: now,
        };

        const newToken = this.jwtService.sign(newPayload, {
          expiresIn: this.configService.get('jwt.expiresIn'),
          issuer: 'wechat-mall-api',
          audience: 'wechat-mall-client',
        });

        // 在响应头中返回新token
        response.setHeader('X-New-Token', newToken);
        response.setHeader('X-Token-Refreshed', 'true');
      }
    } catch (error) {
      // 如果token解析失败，继续处理请求
      console.warn('Token refresh interceptor error:', error.message);
    }

    return next.handle();
  }
}

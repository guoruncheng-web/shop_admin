import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TYPES_KEY, TypesOptions } from '../decorators/types.decorator';
import { AuthService } from '../auth.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    userId?: number;
    id?: number;
    username?: string;
    roles?: string[];
    permissions?: string[];
  };
  permission?: TypesOptions;
  userPermissions?: string[];
}

@Injectable()
export class TypesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 获取装饰器设置的权限配置
    const typesOptions = this.reflector.get<TypesOptions>(
      TYPES_KEY,
      context.getHandler(),
    );

    // 如果没有设置权限配置，直接通过
    if (!typesOptions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    console.log('🔒 TypesGuard - 检查权限:', {
      requiredPermission: typesOptions.permission,
      user: user ? { id: user.userId || user.id, username: user.username } : null,
    });

    // 检查用户是否存在
    if (!user) {
      throw new UnauthorizedException('用户未登录');
    }

    // 获取用户权限
    const userPermissions = await this.authService.getUserPermissionsByUserId(
      user.userId || user.id,
    );

    console.log('🔒 TypesGuard - 用户权限列表:', userPermissions);
    console.log('🔒 TypesGuard - 是否有权限:', userPermissions.includes(typesOptions.permission));

    // 检查用户是否有权限
    const hasPermission = userPermissions.includes(typesOptions.permission);

    if (!hasPermission) {
      console.log('❌ TypesGuard - 权限不足，拒绝访问');
      throw new ForbiddenException('你当前没有操作权限');
    }

    console.log('✅ TypesGuard - 权限验证通过');

    // 将权限信息添加到请求中，供后续使用
    request.permission = typesOptions;
    request.userPermissions = userPermissions;

    return true;
  }
}
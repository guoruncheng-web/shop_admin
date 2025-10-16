import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret') || 'default-secret',
    });
  }

  validate(payload: {
    sub: number;
    username: string;
    roles: string[];
    permissions: string[];
    merchantId?: number;
  }) {
    console.log('🔑 JWT策略 - 验证payload:', {
      sub: payload.sub,
      username: payload.username,
      merchantId: payload.merchantId,
    });

    const result = {
      userId: payload.sub,
      id: payload.sub, // 添加 id 字段，确保与拦截器中的提取逻辑匹配
      sub: payload.sub, // 添加 sub 字段，确保与拦截器中的提取逻辑匹配
      username: payload.username,
      roles: payload.roles,
      permissions: payload.permissions,
      merchantId: payload.merchantId,
    };

    console.log('🔑 JWT策略 - 返回用户信息:', {
      userId: result.userId,
      id: result.id,
      sub: result.sub,
      username: result.username,
      merchantId: result.merchantId,
    });

    return result;
  }
}

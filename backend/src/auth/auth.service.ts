import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as svgCaptcha from 'svg-captcha';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import { LoginDto, LoginResponseDto, CaptchaResponseDto } from './dto/captcha.dto';
import { MenusService } from '../modules/menus/services/menus.service';

@Injectable()
export class AuthService {
  private redis: Redis;

  constructor(
    private configService: ConfigService,
    private menusService: MenusService,
  ) {
    // 初始化Redis连接
    this.redis = new Redis({
      host: this.configService.get('redis.host') || 'localhost',
      port: this.configService.get('redis.port') || 6379,
      password: this.configService.get('redis.password') || '',
      db: this.configService.get('redis.db') || 0,
    });
  }

  // 生成验证码
  async generateCaptcha(): Promise<CaptchaResponseDto> {
    const captchaId = uuidv4();
    const captcha = svgCaptcha.create({
      size: 4,
      noise: 2,
      color: true,
      background: '#f0f0f0',
      width: 120,
      height: 40,
    });

    const expiresIn = this.configService.get('captcha.expires') || 300;
    const expiresAt = Date.now() + expiresIn * 1000;

    // 存储验证码到Redis
    const captchaData = {
      text: captcha.text.toLowerCase(),
      expiresAt,
      createdAt: Date.now(),
    };

    await this.redis.setex(
      `captcha:${captchaId}`,
      expiresIn,
      JSON.stringify(captchaData)
    );

    return {
      captchaId,
      captchaImage: `data:image/svg+xml;base64,${Buffer.from(captcha.data).toString('base64')}`,
      expiresIn,
    };
  }

  // 验证验证码
  async validateCaptcha(captchaId: string, captcha: string): Promise<boolean> {
    const key = `captcha:${captchaId}`;
    const stored = await this.redis.get(key);
    
    if (!stored) {
      return false;
    }

    const captchaData = JSON.parse(stored);
    if (Date.now() > captchaData.expiresAt) {
      await this.redis.del(key);
      return false;
    }

    const isValid = captchaData.text === captcha.toLowerCase();
    if (isValid) {
      await this.redis.del(key);
    }

    return isValid;
  }

  // 清除验证码
  async clearCaptcha(captchaId: string): Promise<void> {
    await this.redis.del(`captcha:${captchaId}`);
  }

  // 获取所有验证码（调试用）
  async getAllCaptchas(): Promise<any[]> {
    const keys = await this.redis.keys('captcha:*');
    const captchas: any[] = [];
    
    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        const captcha = JSON.parse(data);
        captchas.push({
          id: key.replace('captcha:', ''),
          ...captcha
        });
      }
    }
    
    return captchas;
  }

  // 模拟用户验证
  async validateUser(username: string, password: string): Promise<any> {
    // 这里应该连接数据库验证用户
    // 暂时使用模拟数据
    const mockUsers = [
      {
        id: 1,
        username: 'admin',
        password: '123456',
        realName: '超级管理员',
        email: 'admin@example.com',
        phone: '13800138000',
        avatar: '/images/avatar/admin.png',
        roles: ['super_admin'],
        permissions: [
          'system:admin',
          'system:user',
          'system:role',
          'system:permission',
          'product:list',
          'product:create',
          'product:update',
          'product:delete',
          'order:list',
          'order:update',
          'order:delete',
          'banner:list',
          'banner:create',
          'banner:update',
          'banner:delete'
        ],
        roleInfo: [
          {
            id: 1,
            name: '超级管理员',
            code: 'super_admin',
            description: '系统超级管理员，拥有所有权限'
          }
        ]
      },
      {
        id: 2,
        username: 'product_admin',
        password: '123456',
        realName: '商品管理员',
        email: 'product@example.com',
        phone: '13800138001',
        avatar: '/images/avatar/product.png',
        roles: ['product_admin'],
        permissions: [
          'product:list',
          'product:create',
          'product:update',
          'product:delete',
          'category:list',
          'category:create',
          'category:update',
          'category:delete'
        ],
        roleInfo: [
          {
            id: 2,
            name: '商品管理员',
            code: 'product_admin',
            description: '负责商品和分类管理'
          }
        ]
      },
    ];

    const user = mockUsers.find(u => u.username === username && u.password === password);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // 登录
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    // 验证验证码
    const isCaptchaValid = await this.validateCaptcha(loginDto.captchaId, loginDto.captcha);
    if (!isCaptchaValid) {
      throw new UnauthorizedException('验证码错误或已过期');
    }

    // 验证用户
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 获取用户菜单
    const userMenus = await this.menusService.getUserMenusByUserId(user.id);

    // 生成JWT令牌
    const jwtSecret = this.configService.get('jwt.secret');
    const jwtExpiresIn = this.configService.get('jwt.expiresIn');
    
    // 调试信息
    console.log('JWT配置:', {
      secret: jwtSecret ? '已设置' : '未设置',
      expiresIn: jwtExpiresIn,
      env: process.env.JWT_EXPIRES_IN
    });
    
    const payload = {
      sub: user.id,
      username: user.username,
      roles: user.roles,
      permissions: user.permissions,
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: jwtExpiresIn,
      issuer: 'wechat-mall-api',
      audience: 'wechat-mall-client',
    });

    return {
      code: 200,
      data: {
        accessToken,
        user: {
          ...user,
          menus: userMenus, // 添加用户菜单信息
        },
      },
      msg: '登录成功',
    };
  }

  // 验证JWT令牌
  async verifyToken(token: string): Promise<any> {
    try {
      const jwtSecret = this.configService.get('jwt.secret');
      const decoded = jwt.verify(token, jwtSecret, {
        issuer: 'wechat-mall-api',
        audience: 'wechat-mall-client',
      });
      return decoded;
    } catch (error) {
      console.error('JWT verification error:', error);
      return null;
    }
  }

  // 从JWT中提取用户信息
  async getUserFromToken(token: string): Promise<any> {
    const decoded = await this.verifyToken(token);
    if (!decoded) {
      return null;
    }

    // 从token中获取用户ID，然后查询完整的用户信息
    const userId = decoded.sub;
    const mockUsers = [
      {
        id: 1,
        username: 'admin',
        realName: '超级管理员',
        email: 'admin@example.com',
        phone: '13800138000',
        avatar: '/images/avatar/admin.png',
        roles: ['super_admin'],
        permissions: [
          'system:admin', 'system:user', 'system:role', 'system:permission',
          'product:list', 'product:create', 'product:update', 'product:delete',
          'order:list', 'order:update', 'order:delete',
          'banner:list', 'banner:create', 'banner:update', 'banner:delete'
        ],
        roleInfo: [
          { id: 1, name: '超级管理员', code: 'super_admin', description: '系统超级管理员，拥有所有权限' }
        ]
      },
      {
        id: 2,
        username: 'product_admin',
        realName: '商品管理员',
        email: 'product@example.com',
        phone: '13800138001',
        avatar: '/images/avatar/product.png',
        roles: ['product_admin'],
        permissions: [
          'product:list', 'product:create', 'product:update', 'product:delete',
          'category:list', 'category:create', 'category:update', 'category:delete'
        ],
        roleInfo: [
          { id: 2, name: '商品管理员', code: 'product_admin', description: '负责商品和分类管理' }
        ]
      },
    ];

    return mockUsers.find(user => user.id === userId) || null;
  }

  // 刷新JWT令牌
  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      // 验证当前token
      const decoded = await this.verifyToken(token);
      if (!decoded) {
        throw new UnauthorizedException('无效的访问令牌');
      }

      // 检查token是否即将过期（24小时内）
      const now = Math.floor(Date.now() / 1000);
      const tokenExp = decoded.exp;
      const refreshThreshold = 24 * 60 * 60; // 24小时（秒）

      if (tokenExp - now >= refreshThreshold) {
        throw new UnauthorizedException('令牌尚未需要刷新');
      }

      // 生成新的token
      const jwtSecret = this.configService.get('jwt.secret');
      const jwtExpiresIn = this.configService.get('jwt.expiresIn');
      
      const newPayload = {
        sub: decoded.sub,
        username: decoded.username,
        roles: decoded.roles,
        permissions: decoded.permissions,
        iat: now,
      };

      const newToken = jwt.sign(newPayload, jwtSecret, {
        expiresIn: jwtExpiresIn,
        issuer: 'wechat-mall-api',
        audience: 'wechat-mall-client',
      });

      return { accessToken: newToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('令牌刷新失败');
    }
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as svgCaptcha from 'svg-captcha';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import {
  LoginDto,
  LoginResponseDto,
  CaptchaResponseDto,
} from './dto/captcha.dto';
import { MenusService } from '../modules/menus/services/menus.service';
import { Admin } from '../database/entities/admin.entity';
import { UserLoginLogService } from '../modules/login-log/services/user-login-log.service';

@Injectable()
export class AuthService {
  private redis: Redis;

  constructor(
    private configService: ConfigService,
    private menusService: MenusService,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private userLoginLogService: UserLoginLogService,
  ) {
    // 获取Redis配置
    const redisHost = this.configService.get('redis.host') || 'localhost';
    const redisPort = this.configService.get('redis.port') || 6379;
    const redisPassword = this.configService.get('redis.password') || '';
    const redisDb = this.configService.get('redis.db') || 0;

    // 打印Redis连接信息
    console.log('🔗 Redis连接配置:', {
      host: redisHost,
      port: redisPort,
      password: redisPassword ? '***已设置***' : '未设置',
      db: redisDb,
      fullUrl: `redis://${redisHost}:${redisPort}/${redisDb}`,
    });

    // 初始化Redis连接
    this.redis = new Redis({
      host: redisHost,
      port: redisPort,
      password: redisPassword,
      db: redisDb,
    });

    // 监听Redis连接事件
    this.redis.on('connect', () => {
      console.log(
        '✅ Redis连接成功:',
        `redis://${redisHost}:${redisPort}/${redisDb}`,
      );
    });

    this.redis.on('error', (err) => {
      console.error('❌ Redis连接错误:', err.message);
    });
  }

  // 生成验证码
  async generateCaptcha(): Promise<CaptchaResponseDto> {
    const captchaId = uuidv4();
    const captcha = svgCaptcha.create({
      size: 4,
      noise: 1,
      color: false,
      background: '#f0f0f0',
      width: 120,
      height: 40,
      ignoreChars: '0o1il', // 排除容易混淆的字符
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
      JSON.stringify(captchaData),
    );

    return {
      captchaId,
      captchaImage: `data:image/svg+xml;base64,${Buffer.from(captcha.data).toString('base64')}`,
      expiresIn,
    };
  }

  // 验证验证码
  async validateCaptcha(captchaId: string, captcha: string): Promise<boolean> {
    // 开发模式：如果Redis不可用，跳过验证码验证
    const nodeEnv = this.configService.get('app.nodeEnv') || 'development';
    if (nodeEnv === 'development') {
      console.log('🚀 开发模式：跳过验证码验证');
      return true;
    }

    try {
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
    } catch (error) {
      // Redis连接失败时，返回验证码无效
      console.error('Redis连接失败:', error.message);
      return false;
    }
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
          ...captcha,
        });
      }
    }

    return captchas;
  }

  // 验证用户
  async validateUser(
    username: string,
    password: string,
    loginIp?: string,
  ): Promise<any> {
    // 从数据库查找用户
    const user = await this.adminRepository.findOne({
      where: { username },
      relations: ['roles'],
      select: [
        'id',
        'username',
        'password',
        'realName',
        'email',
        'phone',
        'avatar',
        'status',
        'lastLoginTime',
        'lastLoginIp',
      ],
    });

    if (!user) {
      return null;
    }

    // 检查用户状态
    if (user.status !== 1) {
      throw new UnauthorizedException('用户已被禁用');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // 更新登录信息
    await this.adminRepository.update(user.id, {
      lastLoginTime: new Date(),
      lastLoginIp: loginIp || '127.0.0.1',
    });

    // 构建返回的用户信息
    const { password: _, ...userInfo } = user;

    // 提取角色信息
    const roles = user.roles?.map((role) => role.code) || [];
    const roleInfo =
      user.roles?.map((role) => ({
        id: role.id,
        name: role.name,
        code: role.code,
        description: role.description,
      })) || [];

    // 获取用户权限（通过角色）
    const permissions = await this.getUserPermissionsByUserId(user.id);

    return {
      ...userInfo,
      roles,
      roleInfo,
      permissions,
    };
  }

  // 登录
  async login(
    loginDto: LoginDto,
    loginIp?: string,
    userAgent?: string,
  ): Promise<LoginResponseDto> {
    let userId: number | null = null;

    try {
      // 验证验证码
      const isCaptchaValid = await this.validateCaptcha(
        loginDto.captchaId,
        loginDto.captcha,
      );
      if (!isCaptchaValid) {
        throw new UnauthorizedException('验证码错误或已过期');
      }

      // 验证用户
      const user = await this.validateUser(
        loginDto.username,
        loginDto.password,
        loginIp,
      );
      if (!user) {
        // 记录登录失败日志（用户名错误的情况下无法获取userId，设为null）
        await this.userLoginLogService.recordLogin(
          null,
          loginIp || '127.0.0.1',
          userAgent,
          false,
          '用户名或密码错误',
        );
        throw new UnauthorizedException('用户名或密码错误');
      }

      userId = user.id;

      // 获取用户菜单
      const userMenus = await this.menusService.getUserMenusByUserId(user.id);

      // 生成JWT令牌
      const jwtSecret = this.configService.get('jwt.secret');
      const jwtExpiresIn = this.configService.get('jwt.expiresIn');

      // 调试信息
      console.log('JWT配置:', {
        secret: jwtSecret ? '已设置' : '未设置',
        expiresIn: jwtExpiresIn,
        env: process.env.JWT_EXPIRES_IN,
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

      // 记录登录成功日志
      await this.userLoginLogService.recordLogin(
        userId,
        loginIp || '127.0.0.1',
        userAgent,
        true,
      );

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
    } catch (error) {
      // 记录登录失败日志
      if (userId) {
        await this.userLoginLogService.recordLogin(
          userId,
          loginIp || '127.0.0.1',
          userAgent,
          false,
          error.message,
        );
      }
      throw error;
    }
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
          'banner:delete',
        ],
        roleInfo: [
          {
            id: 1,
            name: '超级管理员',
            code: 'super_admin',
            description: '系统超级管理员，拥有所有权限',
          },
        ],
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
          'product:list',
          'product:create',
          'product:update',
          'product:delete',
          'category:list',
          'category:create',
          'category:update',
          'category:delete',
        ],
        roleInfo: [
          {
            id: 2,
            name: '商品管理员',
            code: 'product_admin',
            description: '负责商品和分类管理',
          },
        ],
      },
    ];

    return mockUsers.find((user) => user.id === userId) || null;
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

  // 通过用户ID获取用户权限码
  async getUserPermissionsByUserId(userId: number): Promise<string[]> {
    try {
      const userProfile = await this.menusService.getFullUserProfile(userId);
      return userProfile?.permissions || [];
    } catch (error) {
      console.error('获取用户权限码失败:', error);
      return [];
    }
  }

  // 通过用户ID获取完整用户档案（委托给 MenusService）
  async getUserProfileByUserId(userId: number): Promise<any> {
    return this.menusService.getFullUserProfile(userId);
  }
}

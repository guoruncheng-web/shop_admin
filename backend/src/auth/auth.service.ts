import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const redisHost = this.configService.get('redis.host') || 'localhost';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const redisPort = this.configService.get('redis.port') || 6379;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const redisPassword = this.configService.get('redis.password') || '';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expiresIn,
    };
  }

  // 验证验证码
  async validateCaptcha(captchaId: string, captcha: string): Promise<boolean> {
    // 开发模式：如果Redis不可用，跳过验证码验证
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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

      const captchaData = JSON.parse(stored) as {
        text: string;
        expiresAt: number;
        createdAt: number;
      };
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
      console.error(
        'Redis连接失败:',
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }

  // 清除验证码
  async clearCaptcha(captchaId: string): Promise<void> {
    await this.redis.del(`captcha:${captchaId}`);
  }

  // 获取所有验证码（调试用）
  async getAllCaptchas(): Promise<
    Array<{
      id: string;
      text: string;
      expiresAt: number;
      createdAt: number;
    }>
  > {
    const keys = await this.redis.keys('captcha:*');
    const captchas: Array<{
      id: string;
      text: string;
      expiresAt: number;
      createdAt: number;
    }> = [];

    for (const key of keys) {
      const data = await this.redis.get(key);
      if (data) {
        const captcha = JSON.parse(data) as {
          text: string;
          expiresAt: number;
          createdAt: number;
        };
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
  ): Promise<{
    id: number;
    username: string;
    realName: string;
    email: string;
    phone?: string;
    avatar?: string;
    status: number;
    lastLoginTime?: Date;
    lastLoginIp?: string;
    createdAt: Date;
    updatedAt: Date;
    roles: string[];
    roleInfo: Array<{
      id: number;
      name: string;
      code: string;
      description: string;
    }>;
    permissions: string[];
    merchantId: number;
  } | null> {
    // 从数据库查找用户
    const user = await this.adminRepository.findOne({
      where: { username },
      relations: ['roles', 'merchant'],
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userInfo } = user;

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
      merchantId: user.merchantId,
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
        throw new InternalServerErrorException('用户名或密码错误');
      }

      userId = user.id;

      // 获取用户菜单
      const userMenus = await this.menusService.getUserMenusByUserId(user.id);

      // 生成JWT令牌
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const jwtSecret = this.configService.get('jwt.secret');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
        merchantId: user.merchantId,
        iat: Math.floor(Date.now() / 1000),
      };

      console.log('🔐 登录 - JWT payload 包含商户ID:', {
        userId: user.id,
        username: user.username,
        merchantId: user.merchantId,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const accessToken = jwt.sign(payload, jwtSecret, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expiresIn: jwtExpiresIn,
        issuer: 'wechat-mall-api',
        audience: 'wechat-mall-client',
      } as jwt.SignOptions);

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
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          user: {
            ...user,
            menus: userMenus, // 添加用户菜单信息
          } as any,
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
          error instanceof Error ? error.message : String(error),
        );
      }
      throw error;
    }
  }

  // 验证JWT令牌
  verifyToken(token: string): Promise<any> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const jwtSecret = this.configService.get('jwt.secret');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const decoded = jwt.verify(token, jwtSecret, {
        issuer: 'wechat-mall-api',
        audience: 'wechat-mall-client',
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return decoded as any;
    } catch (error) {
      console.error('JWT verification error:', error);
      return null;
    }
  }

  // 从JWT中提取用户信息
  async getUserFromToken(token: string): Promise<{
    id: number;
    username: string;
    realName: string;
    email: string;
    phone?: string;
    avatar?: string;
    roles: string[];
    permissions: string[];
    roleInfo: Array<{
      id: number;
      name: string;
      code: string;
      description: string;
    }>;
    merchantId: number;
  } | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const decoded = await this.verifyToken(token);
    if (!decoded) {
      return null;
    }

    // 从token中获取用户ID，然后查询完整的用户信息
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const userId = decoded.sub;

    try {
      // 使用 MenusService 的 getFullUserProfile 方法获取完整用户信息
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const userProfile = await this.menusService.getFullUserProfile(userId);

      if (!userProfile) {
        return null;
      }

      // 返回符合接口要求的用户信息
      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        id: userProfile.id,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        username: userProfile.username,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        realName: userProfile.realName,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        email: userProfile.email,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        phone: userProfile.phone,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        avatar: userProfile.avatar,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        roles: userProfile.roles,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        permissions: userProfile.permissions,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        roleInfo: userProfile.roleInfo,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        merchantId: userProfile.merchantId,
      };
    } catch (error) {
      console.error(
        '获取用户信息失败:',
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }

  // 刷新JWT令牌
  async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      // 验证当前token
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const decoded = await this.verifyToken(token);
      if (!decoded) {
        throw new UnauthorizedException('无效的访问令牌');
      }

      // 检查token是否即将过期（24小时内）
      const now = Math.floor(Date.now() / 1000);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      const tokenExp = decoded.exp;
      const refreshThreshold = 24 * 60 * 60; // 24小时（秒）

      if (tokenExp - now >= refreshThreshold) {
        throw new UnauthorizedException('令牌尚未需要刷新');
      }

      // 生成新的token
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const jwtSecret = this.configService.get('jwt.secret');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const jwtExpiresIn = this.configService.get('jwt.expiresIn');

      const newPayload = {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        sub: decoded.sub,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        username: decoded.username,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        roles: decoded.roles,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        permissions: decoded.permissions,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        merchantId: decoded.merchantId,
        iat: now,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const newToken = jwt.sign(newPayload, jwtSecret, {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        expiresIn: jwtExpiresIn,
        issuer: 'wechat-mall-api',
        audience: 'wechat-mall-client',
      } as jwt.SignOptions);

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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const userProfile = await this.menusService.getFullUserProfile(userId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      return userProfile?.permissions || [];
    } catch (error) {
      console.error(
        '获取用户权限码失败:',
        error instanceof Error ? error.message : String(error),
      );
      return [];
    }
  }

  // 通过用户ID获取完整用户档案（委托给 MenusService）
  async getUserProfileByUserId(userId: number): Promise<any> {
    return this.menusService.getFullUserProfile(userId);
  }
}

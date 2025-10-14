import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Headers,
  UnauthorizedException,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/captcha.dto';
import { Public } from './decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface CustomRequest extends ExpressRequest {
  user?: { userId?: number; id?: number };
}

@ApiTags('认证管理')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('captcha')
  @Public()
  @ApiOperation({
    summary: '获取图形验证码',
    description: '生成SVG格式的图形验证码，返回验证码ID和图片数据',
  })
  @ApiResponse({
    status: 200,
    description: '验证码生成成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            captchaId: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            captchaImage: {
              type: 'string',
              example: 'data:image/svg+xml;base64,...',
            },
            expiresIn: { type: 'number', example: 300 },
          },
        },
        msg: { type: 'string', example: '验证码生成成功' },
      },
    },
  })
  async getCaptcha(): Promise<any> {
    const captcha = await this.authService.generateCaptcha();
    return {
      code: 200,
      data: captcha,
      msg: '验证码生成成功',
    };
  }

  @Get('captcha/debug')
  @Public()
  @ApiOperation({
    summary: '查看所有验证码（调试用）',
    description: '查看Redis中存储的所有验证码信息（仅开发环境）',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'array', items: { type: 'object' } },
        msg: { type: 'string', example: '获取成功' },
      },
    },
  })
  async getCaptchaDebug() {
    const captchas = await this.authService.getAllCaptchas();
    return {
      code: 200,
      data: captchas,
      msg: '获取成功',
    };
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '管理员登录',
    description: '使用用户名、密码和验证码进行登录',
  })
  @ApiBody({
    type: LoginDto,
    description: '登录信息',
  })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: '服务器错误 - 用户名或密码错误',
  })
  @ApiResponse({
    status: 400,
    description: '验证码错误或已过期',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: ExpressRequest,
  ): Promise<LoginResponseDto> {
    // 改进的IP获取方式，考虑多种代理情况
    const getClientIp = (req: ExpressRequest): string => {
      // 按优先级尝试获取真实IP
      const forwardedFor = req.headers['x-forwarded-for'] as string | undefined;
      const realIp = req.headers['x-real-ip'] as string | undefined;
      const clientIp = req.headers['x-client-ip'] as string | undefined;

      // 处理X-Forwarded-For头，可能包含多个IP（客户端IP, 代理IP1, 代理IP2）
      if (forwardedFor) {
        const ips = forwardedFor.split(',').map((ip: string) => ip.trim());
        // 过滤掉私有IP，取第一个公网IP
        for (const ip of ips) {
          if (this.isValidPublicIP(ip)) {
            return ip;
          }
        }
        // 如果没有公网IP，返回第一个IP
        return ips[0];
      }

      // 尝试其他HTTP头
      if (realIp && this.isValidIP(realIp)) return realIp;
      if (clientIp && this.isValidIP(clientIp)) return clientIp;

      // 从连接信息获取IP
      const connectionIp =
        req.ip || (req as any).connection?.remoteAddress || '127.0.0.1';

      if (connectionIp && this.isValidIP(connectionIp)) {
        return this.cleanIPv6(connectionIp);
      }

      // 默认值
      return '127.0.0.1';
    };

    const clientIp = getClientIp(request);
    const userAgent = request.headers['user-agent'] || '';

    // 详细的登录信息日志
    console.log('🔍 登录IP详细信息:', {
      'X-Forwarded-For': request.headers['x-forwarded-for'],
      'X-Real-IP': request.headers['x-real-ip'],
      'X-Client-IP': request.headers['x-client-ip'],
      'Request-IP': request.ip,
      最终IP: clientIp,
      'User-Agent':
        userAgent.substring(0, 100) + (userAgent.length > 100 ? '...' : ''),
    });

    return this.authService.login(loginDto, clientIp, userAgent);
  }

  // 验证IP地址格式是否有效
  private isValidIP(ip: string): boolean {
    if (!ip) return false;

    // IPv4格式验证
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    if (ipv4Regex.test(ip)) {
      const octets = ip.split('.').map(Number);
      return octets.every((octet) => octet >= 0 && octet <= 255);
    }

    // IPv6格式验证（简化版）
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$|^::1$|^::$/;
    return ipv6Regex.test(ip);
  }

  // 验证是否为公网IP
  private isValidPublicIP(ip: string): boolean {
    if (!this.isValidIP(ip)) return false;

    // IPv6地址暂时不做公网私网判断
    if (ip.includes(':')) return true;

    const octets = ip.split('.').map(Number);

    // 排除私有IP范围
    return !(
      octets[0] === 10 || // 10.0.0.0/8
      (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) || // 172.16.0.0/12
      (octets[0] === 192 && octets[1] === 168) || // 192.168.0.0/16
      octets[0] === 127 || // 127.0.0.0/8
      (octets[0] === 169 && octets[1] === 254) // 169.254.0.0/16
    );
  }

  // 清理IPv6地址格式
  private cleanIPv6(ip: string): string {
    // 移除IPv4映射的IPv6前缀
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    return ip;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取当前用户信息',
    description: '根据JWT令牌获取当前登录用户的详细信息，包含所属商户信息',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
            realName: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            avatar: { type: 'string' },
            merchantId: { type: 'number', example: 1 },
            merchant: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                merchantCode: { type: 'string', example: 'SUPER_MERCHANT' },
                merchantName: { type: 'string', example: '平台超级商户' },
                merchantType: { type: 'number', example: 1 },
                status: { type: 'number', example: 1 },
                logo: { type: 'string' },
                description: { type: 'string', example: '平台超级商户，拥有最高权限' },
                certificationStatus: { type: 'number', example: 2 },
                maxProducts: { type: 'number' },
                maxAdmins: { type: 'number' },
                maxStorage: { type: 'number' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
            roles: { type: 'array', items: { type: 'string' } },
            permissions: { type: 'array', items: { type: 'string' } },
            roleInfo: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  code: { type: 'string' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        msg: { type: 'string', example: '获取成功' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '未授权 - JWT令牌无效或已过期',
  })
  async getProfile(@Request() req: CustomRequest) {
    const uid = req?.user?.userId ?? req?.user?.id;
    if (!uid) {
      throw new UnauthorizedException('无法识别用户ID');
    }
    const fullProfile = await this.authService.getUserProfileByUserId(
      Number(uid),
    );

    return {
      code: 200,
      data: fullProfile, // 包含 基础信息 + roles + permissions + roleInfo + menus + merchant
      msg: '获取成功',
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '退出登录',
    description: '客户端清除本地存储的token',
  })
  @ApiResponse({
    status: 200,
    description: '退出成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'object', example: {} },
        msg: { type: 'string', example: '退出成功' },
      },
    },
  })
  async logout() {
    return {
      code: 200,
      data: {},
      msg: '退出成功',
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 401, description: '刷新失败' })
  async refreshToken(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('缺少访问令牌');
    }

    const token = authHeader.substring(7);
    const result = await this.authService.refreshToken(token);

    return {
      code: 200,
      data: {
        accessToken: result.accessToken,
        expiresIn: this.configService.get('jwt.expiresIn'),
      },
      msg: '令牌刷新成功',
    };
  }

  @Get('codes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取用户权限码',
    description: '根据JWT令牌获取当前登录用户的权限码列表',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'array',
          items: { type: 'string' },
          example: ['system:admin', 'system:user', 'product:list'],
        },
        msg: { type: 'string', example: '获取成功' },
      },
    },
  })
  async getAccessCodes(@Request() req: CustomRequest) {
    try {
      const uid = req?.user?.userId ?? req?.user?.id;
      if (!uid) {
        throw new UnauthorizedException('无法识别用户ID');
      }

      // 获取用户权限码
      const accessCodes = await this.authService.getUserPermissionsByUserId(
        Number(uid),
      );

      return {
        code: 200,
        data: accessCodes,
        msg: '获取成功',
      };
    } catch (error) {
      console.error('获取用户权限码失败:', error);
      throw error;
    }
  }

  @Get('verify')
  @ApiOperation({
    summary: '验证JWT令牌',
    description: '验证JWT令牌的有效性并返回用户信息',
  })
  @ApiResponse({
    status: 200,
    description: '验证成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            valid: { type: 'boolean', example: true },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                username: { type: 'string' },
                realName: { type: 'string' },
                roles: { type: 'array', items: { type: 'string' } },
                permissions: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
        msg: { type: 'string', example: '验证成功' },
      },
    },
  })
  async verifyToken(@Query('token') token: string) {
    if (!token) {
      return {
        code: 200,
        data: { valid: false },
        msg: 'Token is required',
      };
    }

    const user = await this.authService.getUserFromToken(token);

    return {
      code: 200,
      data: {
        valid: !!user,
        user: user || null,
      },
      msg: '验证成功',
    };
  }
}

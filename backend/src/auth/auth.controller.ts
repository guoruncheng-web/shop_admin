import { Controller, Post, Body, Get, HttpCode, HttpStatus, Query, Res, Headers, UnauthorizedException, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto, CaptchaResponseDto } from './dto/captcha.dto';
import { Public } from './decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('认证管理')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {}

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
            captchaId: { type: 'string', example: '550e8400-e29b-41d4-a716-446655440000' },
            captchaImage: { type: 'string', example: 'data:image/svg+xml;base64,...' },
            expiresIn: { type: 'number', example: 300 }
          }
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
    status: 401,
    description: '登录失败 - 用户名或密码错误',
  })
  @ApiResponse({
    status: 400,
    description: '验证码错误或已过期',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '获取当前用户信息',
    description: '根据JWT令牌获取当前登录用户的详细信息',
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
                  description: { type: 'string' }
                }
              }
            }
          }
        },
        msg: { type: 'string', example: '获取成功' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '未授权 - JWT令牌无效或已过期',
  })
  async getProfile(@Request() req) {
    const uid = req?.user?.userId ?? req?.user?.id;
    if (!uid) {
      throw new UnauthorizedException('无法识别用户ID');
    }
    const fullProfile = await this.authService.getUserProfileByUserId(Number(uid));

    return {
      code: 200,
      data: fullProfile, // 包含 基础信息 + roles + permissions + roleInfo + menus
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
              }
            }
          }
        },
        msg: { type: 'string', example: '验证成功' },
      }
    }
  })
  async verifyToken(@Query('token') token: string) {
    if (!token) {
      return {
        code: 200,
        data: { valid: false },
        msg: 'Token is required'
      };
    }

    const user = await this.authService.getUserFromToken(token);
    
    return {
      code: 200,
      data: {
        valid: !!user,
        user: user || null
      },
      msg: '验证成功'
    };
  }
}

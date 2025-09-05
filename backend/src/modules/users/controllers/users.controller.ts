import {
  Controller,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('用户管理')
@Controller('user')
export class UsersController {
  constructor() {}

  @Get('info')
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
  async getUserInfo(@Request() req) {
    const user = req.user;
    return {
      code: 200,
      data: user,
      msg: '获取成功',
    };
  }
}
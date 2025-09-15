import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto, ChangePasswordDto } from '../dto/update-user.dto';
import { QueryUserDto } from '../dto/query-user.dto';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('info')
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

  @Get()
  @ApiOperation({ summary: '获取用户列表', description: '分页查询用户列表，支持搜索和筛选' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() queryDto: QueryUserDto) {
    const result = await this.usersService.findAll(queryDto);
    return {
      code: 200,
      data: result,
      msg: '获取成功',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情', description: '根据ID获取用户详细信息' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findById(id);
    return {
      code: 200,
      data: user,
      msg: '获取成功',
    };
  }

  @Post()
  @ApiOperation({ summary: '创建用户', description: '创建新用户' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      code: 200,
      data: user,
      msg: '创建成功',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户', description: '更新用户信息' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      code: 200,
      data: user,
      msg: '更新成功',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户', description: '删除指定用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);
    return {
      code: 200,
      msg: '删除成功',
    };
  }

  @Post('batch-delete')
  @ApiOperation({ summary: '批量删除用户', description: '批量删除多个用户' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @HttpCode(HttpStatus.OK)
  async batchRemove(@Body('ids') ids: number[]) {
    await this.usersService.batchRemove(ids);
    return {
      code: 200,
      msg: '批量删除成功',
    };
  }

  @Put(':id/change-password')
  @ApiOperation({ summary: '修改密码', description: '用户修改自己的密码' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '修改成功' })
  @ApiResponse({ status: 400, description: '旧密码不正确' })
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    await this.usersService.changePassword(id, changePasswordDto);
    return {
      code: 200,
      msg: '密码修改成功',
    };
  }

  @Put(':id/reset-password')
  @ApiOperation({ summary: '重置密码', description: '管理员重置用户密码' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '重置成功' })
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('newPassword') newPassword: string,
  ) {
    await this.usersService.resetPassword(id, newPassword);
    return {
      code: 200,
      msg: '密码重置成功',
    };
  }

  @Put(':id/toggle-status')
  @ApiOperation({ summary: '切换用户状态', description: '启用或禁用用户' })
  @ApiParam({ name: 'id', description: '用户ID' })
  @ApiResponse({ status: 200, description: '操作成功' })
  @HttpCode(HttpStatus.OK)
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.toggleStatus(id);
    return {
      code: 200,
      data: user,
      msg: '状态切换成功',
    };
  }
}
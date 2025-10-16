import {
  Controller,
  Get,
  Query,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserLoginLogService } from '../services/user-login-log.service';
import { QueryUserLoginLogDto } from '../dto/create-login-log.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { TypesGuard } from '../../../auth/guards/types.guard';
import { Types } from '../../../auth/decorators/types.decorator';

@ApiTags('用户登录日志')
@Controller('login-logs')
@UseGuards(JwtAuthGuard, TypesGuard)
@ApiBearerAuth()
export class UserLoginLogController {
  constructor(private readonly userLoginLogService: UserLoginLogService) {}

  @Get()
  @Types('system:loginLog:view', {
    name: '查看登录日志',
    module: 'login-log',
    operation: 'view',
    includeParams: false,
  })
  @ApiOperation({ summary: '获取用户登录日志列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll(@Query() query: QueryUserLoginLogDto) {
    return await this.userLoginLogService.findAll(query);
  }

  @Get(':id')
  @Types('system:login-log:view', {
    name: '查看登录日志详情',
    module: 'login-log',
    operation: 'view',
    includeParams: false,
  })
  @ApiOperation({ summary: '获取单个登录日志详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findOne(@Param('id') id: string) {
    const loginLog = await this.userLoginLogService.findOne(+id);
    return {
      code: 200,
      data: loginLog,
      msg: '获取成功',
    };
  }

  @Delete(':id')
  @Types('system:login-log:delete', {
    name: '删除登录日志',
    module: 'login-log',
    operation: 'delete',
    includeParams: false,
  })
  @ApiOperation({ summary: '删除登录日志' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string) {
    await this.userLoginLogService.remove(+id);
    return {
      code: 200,
      data: null,
      msg: '删除成功',
    };
  }

  @Delete('clear/old')
  @Types('system:login-log:clear', {
    name: '清理登录日志',
    module: 'login-log',
    operation: 'clear',
    includeParams: false,
  })
  @ApiOperation({ summary: '清理旧的登录日志' })
  @ApiResponse({ status: 200, description: '清理成功' })
  async clearOldLogs(@Query('days') days?: string) {
    const daysToKeep = days ? parseInt(days) : 30;
    await this.userLoginLogService.clearOldLogs(daysToKeep);
    return {
      code: 200,
      data: null,
      msg: `已清理${daysToKeep}天前的登录日志`,
    };
  }
}

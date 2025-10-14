import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { seedUserLoginLogs } from '../seeds/user-login-log.seed';
import { Public } from '../../../auth/decorators/public.decorator';
import { Types } from '../../../auth/decorators/types.decorator';
@ApiTags('数据初始化')
@Controller('seed')
export class SeedController {
  constructor(private readonly dataSource: DataSource) {}

  @Post('login-logs')
  @Types('system:login-log:view', {
    name: '查看登录日志',
    module: 'login-log',
    operation: 'view',
    includeParams: false
  })
  @Public()
  @ApiOperation({ summary: '初始化用户登录日志测试数据' })
  async seedLoginLogs() {
    try {
      await seedUserLoginLogs(this.dataSource);
      return {
        code: 200,
        data: null,
        msg: '用户登录日志测试数据初始化成功',
      };
    } catch (error) {
      return {
        code: 500,
        data: null,
        msg: `初始化失败: ${error.message}`,
      };
    }
  }
}

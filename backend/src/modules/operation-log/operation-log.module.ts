import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OperationLog } from './entities/operation-log.entity';
import { OperationLogService } from './services/operation-log.service';
import { OperationLogController } from './controllers/operation-log.controller';
import { OperationLogInterceptor } from './interceptors/operation-log.interceptor';
import { Admin } from '../../database/entities/admin.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { LoginLogModule } from '../login-log/login-log.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([OperationLog, Admin, Merchant]),
    LoginLogModule, // 导入登录日志模块以使用IP定位服务
  ],
  controllers: [OperationLogController],
  providers: [OperationLogService, OperationLogInterceptor],
  exports: [OperationLogService, OperationLogInterceptor],
})
export class OperationLogModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { Admin } from '../../database/entities/admin.entity';
import { Role } from '../../database/entities/role.entity';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { OperationLogInterceptor } from '../operation-log/interceptors/operation-log.interceptor';
import { LoginLogModule } from '../login-log/login-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, Role]), LoginLogModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    {
      provide: APP_INTERCEPTOR,
      useClass: OperationLogInterceptor,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}

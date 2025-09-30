import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLoginLog } from './entities/user-login-log.entity';
import { UserLoginLogService } from './services/user-login-log.service';
import { IpLocationService } from './services/ip-location.service';
import { UserLoginLogController } from './controllers/user-login-log.controller';
import { SeedController } from './controllers/seed.controller';
import { Admin } from '../../database/entities/admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserLoginLog, Admin])],
  controllers: [UserLoginLogController, SeedController],
  providers: [UserLoginLogService, IpLocationService],
  exports: [UserLoginLogService, IpLocationService],
})
export class LoginLogModule {}

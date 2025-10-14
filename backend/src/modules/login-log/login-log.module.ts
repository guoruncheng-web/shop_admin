import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLoginLog } from './entities/user-login-log.entity';
import { UserLoginLogService } from './services/user-login-log.service';
import { IpLocationService } from './services/ip-location.service';
import { UserLoginLogController } from './controllers/user-login-log.controller';
import { SeedController } from './controllers/seed.controller';
import { Admin } from '../../database/entities/admin.entity';
import { Merchant } from '../merchants/entities/merchant.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserLoginLog, Admin, Merchant]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserLoginLogController, SeedController],
  providers: [UserLoginLogService, IpLocationService],
  exports: [UserLoginLogService, IpLocationService],
})
export class LoginLogModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLoginLog } from './entities/user-login-log.entity';
import { UserLoginLogService } from './services/user-login-log.service';
import { UserLoginLogController } from './controllers/user-login-log.controller';
import { SeedController } from './controllers/seed.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserLoginLog]),
  ],
  controllers: [UserLoginLogController, SeedController],
  providers: [UserLoginLogService],
  exports: [UserLoginLogService],
})
export class LoginLogModule {}
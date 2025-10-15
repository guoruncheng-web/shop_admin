import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MenusModule } from '../modules/menus/menus.module';
import { LoginLogModule } from '../modules/login-log/login-log.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TypesGuard } from './guards/types.guard';
import { TokenRefreshInterceptor } from '../common/interceptors/token-refresh.interceptor';
import { Admin } from '../database/entities/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    MenusModule,
    LoginLogModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn'),
          issuer: 'wechat-mall-api',
          audience: 'wechat-mall-client',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    TypesGuard,
    {
      provide: APP_INTERCEPTOR,
      useClass: TokenRefreshInterceptor,
    },
  ],
  exports: [AuthService, JwtAuthGuard, TypesGuard, JwtModule],
})
export class AuthModule {}

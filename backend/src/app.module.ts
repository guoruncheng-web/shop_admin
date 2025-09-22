/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { redisStore } from 'cache-manager-redis-store';
import { APP_GUARD } from '@nestjs/core';

import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 认证模块
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './modules/upload/upload.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

// 业务模块
import { MenusModule } from './modules/menus/menus.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { ResourceModule } from './modules/resource/resource.module';
import { MigrationController } from './database/migration.controller';
import { Permission } from './database/entities/permission.entity';
import { Menu } from './modules/menus/entities/menu.entity';
import { Role } from './database/entities/role.entity';
import { Admin } from './database/entities/admin.entity';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        charset: configService.get('database.charset'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: configService.get('database.logging'),
        timezone: '+08:00',
        dateStrings: true,
        supportBigNumbers: true,
        bigNumberStrings: false,
        extra: {
          connectionLimit: 10,
        },
        // 禁用默认的 timestamp 精度
        legacySpatialSupport: false,
        // 设置 MySQL 版本以避免精度问题
        version: '8.0',
        // 禁用微秒精度
        options: {
          useUTC: false,
          dateStrings: true,
        },
      }),
      inject: [ConfigService],
    }),

    // 缓存模块 (使用Redis)
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
        password: configService.get('redis.password'),
        db: configService.get('redis.db'),
        ttl: configService.get('redis.ttl'),
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),

    // 定时任务模块
    ScheduleModule.forRoot(),

    // 认证模块
    AuthModule,

    // 文件上传模块
    UploadModule,

    // 业务模块
    MenusModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    ResourceModule,

    // 为迁移控制器添加TypeORM实体
    TypeOrmModule.forFeature([Permission, Menu, Role, Admin]),
  ],
  controllers: [AppController, MigrationController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }

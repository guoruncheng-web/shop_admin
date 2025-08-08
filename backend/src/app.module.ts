import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { redisStore } from 'cache-manager-redis-store';

import configuration from './config/configuration';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// 认证模块
import { AuthModule } from './auth/auth.module';

// 业务模块
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { UsersModule } from './modules/users/users.module';
import { OrdersModule } from './modules/orders/orders.module';
import { BannersModule } from './modules/banners/banners.module';
import { LogsModule } from './modules/logs/logs.module';

// 管理模块
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env.local', '.env'],
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
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        timezone: '+08:00',
        dateStrings: true,
      }),
      inject: [ConfigService],
    }),

    // 缓存模块 (使用Redis)
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB'),
        ttl: 60 * 60, // 1小时
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),

    // 定时任务模块
    ScheduleModule.forRoot(),

    // 认证模块
    AuthModule,

    // 业务模块
    ProductsModule,
    CategoriesModule,
    UsersModule,
    OrdersModule,
    BannersModule,
    LogsModule,

    // 管理模块
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
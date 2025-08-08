import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';
import helmet from 'helmet';
import compression from 'compression';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TokenRefreshInterceptor } from './common/interceptors/token-refresh.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 基础中间件
  app.use(helmet());
  app.use(compression());
  
  // 跨域配置
  app.enableCors({
    origin: configService.get('cors.origin') || ['http://localhost:3000', 'http://localhost:5666'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // API前缀
  const apiPrefix = configService.get('app.apiPrefix') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局拦截器
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );

  // Session配置 (暂时使用内存存储，避免Redis连接问题)
  app.use(
    session({
      secret: configService.get('session.secret') || 'default-secret',
      resave: false,
      saveUninitialized: false,
      name: 'wechat_mall_session',
      cookie: {
        maxAge: configService.get('session.maxAge') || 86400000, // 24小时
        httpOnly: true,
        secure: configService.get('app.nodeEnv') === 'production',
        sameSite: 'lax',
      },
    }),
  );

  // Swagger文档配置
  if (configService.get('app.apiDocsEnabled') !== false) {
    const config = new DocumentBuilder()
      .setTitle('微信小程序商城后台管理API')
      .setDescription('微信小程序商城后台管理系统API文档')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('wechat_mall_session')
      .addTag('认证管理', '管理员登录认证相关接口')
      .addTag('权限管理', '角色权限管理相关接口')
      .addTag('商品管理', '商品信息管理相关接口')
      .addTag('分类管理', '商品分类管理相关接口')
      .addTag('用户管理', '用户信息管理相关接口')
      .addTag('订单管理', '订单信息管理相关接口')
      .addTag('Banner管理', 'Banner轮播图管理相关接口')
      .addTag('日志管理', '系统日志管理相关接口')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // 启动应用
  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}${apiPrefix}`);
  if (configService.get('API_DOCS_ENABLED') !== 'false') {
    console.log(`📚 API Documentation: http://localhost:${port}${apiPrefix}/docs`);
  }
}

bootstrap();
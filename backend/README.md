# 微信小程序商城后台管理API

## 项目状态

✅ **项目已成功创建并运行**

- NestJS框架已配置
- TypeORM数据库连接已配置
- 基础模块结构已创建
- API文档集成完成
- 开发服务器正常运行

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制 `.env` 文件并根据实际情况修改数据库配置：
```bash
# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root123
DB_DATABASE=wechat_mall_dev
```

### 3. 启动开发服务器
```bash
npm run start:dev
```

### 4. 访问API文档
```
http://localhost:3000/api/v1/docs
```

## 项目结构

```
src/
├── auth/                    # 认证模块
│   ├── dto/                 # 数据传输对象
│   ├── guards/              # 守卫
│   ├── strategies/          # 认证策略
│   ├── auth.controller.ts   # 认证控制器
│   ├── auth.service.ts      # 认证服务
│   └── auth.module.ts       # 认证模块
├── admin/                   # 管理模块
├── common/                  # 通用组件
│   ├── filters/            # 异常过滤器
│   └── interceptors/       # 拦截器
├── config/                  # 配置文件
├── database/                # 数据库相关
│   └── entities/           # 实体文件
└── modules/                 # 业务模块
    ├── products/           # 商品管理
    ├── categories/         # 分类管理
    ├── users/              # 用户管理
    ├── orders/             # 订单管理
    ├── banners/            # Banner管理
    └── logs/               # 日志管理
```

## 已创建的实体

- **Admin**: 管理员实体
- **Role**: 角色实体
- **Permission**: 权限实体
- **AdminLoginLog**: 登录日志实体
- **AdminOperationLog**: 操作日志实体

## API端点

### 认证管理
- `POST /api/v1/auth/login` - 管理员登录

### 商品管理
- `GET /api/v1/products` - 获取商品列表

### 分类管理
- `GET /api/v1/categories` - 获取分类列表

## 下一步开发

1. **完善数据库实体**: 添加商品、分类、用户等实体
2. **实现认证逻辑**: 完善登录、权限验证功能
3. **开发业务接口**: 实现CRUD操作
4. **添加数据验证**: 创建DTO和验证规则
5. **集成测试**: 编写单元测试和集成测试

## 技术栈

- **框架**: NestJS 10.x
- **数据库**: MySQL 8.0 + TypeORM
- **缓存**: Redis (当前使用内存缓存)
- **认证**: JWT + Passport + Session
- **文档**: Swagger/OpenAPI
- **验证**: class-validator
- **日志**: Winston (待集成)

## 开发命令

```bash
# 开发模式
npm run start:dev

# 生产构建
npm run build

# 运行测试
npm run test

# 代码格式化
npm run format

# 代码检查
npm run lint
```

## 环境配置

项目支持多环境配置：
- **开发环境**: `.env`
- **测试环境**: `.env.test`
- **生产环境**: `.env.production`

## 注意事项

1. 确保MySQL和Redis服务正在运行
2. 数据库需要手动创建，表结构会自动同步（开发环境）
3. 生产环境需要手动运行数据库迁移
4. API文档仅在非生产环境启用
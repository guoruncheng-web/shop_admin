# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WeChat Mini Program E-commerce system with a full-stack architecture:
- **Backend**: NestJS (Node.js + TypeScript) API service with MySQL + Redis
- **Admin Frontend**: Vue 3 + Vben Admin framework for management dashboard
- **H5 Frontend**: Next.js for mobile H5 e-commerce site
- **Database**: MySQL 8.0 with comprehensive RBAC permission system

## Development Commands

### Backend (NestJS)
```bash
cd backend

# Development
npm run start:dev              # Standard development server
npm run start:dev-env          # Development with NODE_ENV=development
npm run start:test-env         # Testing environment
npm run start:prod-env         # Production environment

# Alternative environment startup
npm run env:dev                # Using shell script for development
npm run env:test               # Using shell script for testing
npm run env:prod               # Using shell script for production

# Build and Production
npm run build                  # Build the application
npm run start:prod             # Start production server

# Testing
npm run test                   # Run unit tests
npm run test:watch             # Run tests in watch mode
npm run test:cov               # Run tests with coverage
npm run test:e2e               # Run end-to-end tests

# Code Quality
npm run lint                   # Run ESLint with auto-fix
npm run format                 # Format code with Prettier
```

### Admin Frontend (Vben Admin)
```bash
cd frontend/vben-admin

# Development
pnpm dev:ele                   # Start the admin dashboard in development
pnpm build:ele                 # Build the admin dashboard for production
pnpm check:type                # Run TypeScript type checking

# Root level commands (from vben-admin directory)
pnpm dev                       # Start development server
pnpm build                     # Build for production
pnpm lint                      # Run linting
pnpm format                    # Format code
```

### H5 Frontend (Next.js)
```bash
cd frontend/h5-ecommerce

# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint
```

## Architecture Overview

### Backend Architecture (NestJS)
- **Modular Structure**: Each business domain has its own module (auth, menus, users, roles, permissions, resources, etc.)
- **Authentication**: Session + Cookie based authentication with Redis session storage
- **Authorization**: RBAC (Role-Based Access Control) with three permission levels:
  - Menu permissions (controls sidebar visibility)
  - Route permissions (controls page access)
  - Button permissions (controls operation buttons)
- **Database**: TypeORM with MySQL, entities auto-discovered from `**/*.entity{.ts,.js}`
- **Caching**: Redis for session storage and permission caching
- **Logging**: Comprehensive login logs and operation logs with Winston
- **File Upload**: Tencent Cloud COS integration for file storage

### Key Backend Modules
- `src/auth/`: Authentication module with JWT and session strategies
- `src/modules/menus/`: Menu management with tree structure support
- `src/modules/roles/`: Role management system
- `src/modules/permissions/`: Permission management system
- `src/modules/login-log/`: Login activity tracking
- `src/modules/upload/`: File upload handling with chunk upload support
- `src/modules/resource/`: Resource pool management system
- `src/database/entities/`: TypeORM entity definitions

### Frontend Architecture (Admin)
- **Framework**: Vue 3 + TypeScript with Vben Admin UI framework
- **Routing**: Dynamic routing based on user permissions from backend
- **State Management**: Pinia for state management
- **API Layer**: Centralized request client with interceptors
- **Permission Control**: 
  - Route guards check access permissions
  - Component-level permission directives
  - API-driven menu generation

### Database Design
- **Multi-environment support**: Separate databases for dev/test/prod
- **RBAC Implementation**: admins -> roles -> permissions relationship
- **Menu System**: Hierarchical tree structure with parent-child relationships
- **Audit Trails**: Comprehensive logging of user actions and login attempts

## Environment Configuration

The project supports multiple environments with different configurations:

### Environment Files
- `.env.development` - Development environment
- `.env.testing` - Testing environment  
- `.env.production` - Production environment

### Key Configuration Areas
- **Database**: Separate databases per environment (wechat_mall_dev, wechat_mall_test, wechat_mall_prod)
- **Redis**: Different DB numbers per environment (0 for dev/prod, 1 for test)
- **Security**: Different encryption rounds and password requirements per environment
- **API Documentation**: Enabled in dev/test, disabled in production

## Common Development Tasks

### Working with Permissions
- Permissions follow a hierarchical code structure: `module:submodule` (e.g., `system:admin`, `product:list`)
- Route permissions are prefixed with `route:` (e.g., `route:system`, `route:product:list`)
- Button permissions are prefixed with `btn:` (e.g., `btn:add`, `btn:edit`, `btn:delete`)

### Menu System
- Menus support tree structure with unlimited nesting
- Menu types: 1=Directory, 2=Menu, 3=Button
- Frontend automatically generates routes from backend menu API
- Menu permissions control sidebar visibility

### Database Migrations
- SQL migration files in `backend/database/migrations/`
- Manual migration execution via migration controllers
- Initialization scripts available for fresh database setup

### File Upload
- Supports both single file and chunk upload for large files
- Integrates with Tencent Cloud COS for cloud storage
- Upload endpoints: `/upload/single` and `/upload/chunk`

## Testing and Quality

### Backend Testing
- Jest for unit testing with TypeScript support
- E2E testing configuration available
- Coverage reporting enabled
- ESLint + Prettier for code quality

### API Documentation
- Swagger/OpenAPI documentation available at `/api/v1/docs` in development
- Comprehensive API documentation for all endpoints
- Authentication and permission requirements documented

## Deployment Notes

### Environment Variables Required
- Database connection details (host, port, username, password, database name)
- Redis connection details (host, port, password, database number)
- Session configuration (secret, timeout)
- File upload configuration (Tencent COS credentials)
- JWT configuration (secret, expiration)

### Production Considerations
- Database synchronization disabled in production
- API documentation disabled in production
- Enhanced security settings (bcrypt rounds, session configuration)
- Comprehensive logging and monitoring enabled

## Important File Locations

### Backend Key Files
- `src/app.module.ts` - Main application module with all imports
- `src/config/configuration.ts` - Centralized configuration management
- `backend/QUICK_START.md` - Detailed backend setup guide
- `backend/ENV_SUMMARY.md` - Environment configuration reference

### Frontend Key Files
- `frontend/vben-admin/apps/web-ele/src/api/` - API client definitions
- `frontend/vben-admin/apps/web-ele/src/router/` - Route configuration
- `frontend/vben-admin/apps/web-ele/src/views/system/` - Admin management pages

### Documentation
- `docs/后台登录权限设计.md` - Comprehensive authentication and authorization design
- `README.md` - Project overview and quick start guide

## Development Workflow

1. **Setup**: Ensure MySQL and Redis are running with proper configurations
2. **Backend**: Start with `npm run start:dev` from backend directory
3. **Frontend**: Start with `pnpm dev:ele` from vben-admin directory
4. **Database**: Initialize with SQL files in `database/` directory if needed
5. **Testing**: Access API docs at `http://localhost:3000/api/v1/docs`
- 现在后端只有建立了后台的项目 '/Users/mac/test/cursor1/cursor_shop/backend' 这是数据库文件 '/Users/mac/test/cursor1/cursor_shop/database'
- '/Users/mac/test/cursor1/cursor_shop/frontend/vben-admin' 这是后台前端项目 。'/Users/mac/test/cursor1/cursor_shop/frontend/h5-ecommerce' 这是项目的h5 webSite电商商城项目
- 我问你之前服务都已经启动了 不用你自己启动

# h5-ecommerce

# 移动端服装电商平台设计稿(多商户)
1. 主题:米白高级
2. 底部tarBar需要有四个, 首页，分类，购物车，个人
3. 首页布局
- banne是个轮播图用来
- 品牌 点击品牌可以到商品列表
- 折扣专区 显示 显示带有折扣标签的前4个商品 点击商品可以到商品详情
- 热销专区 显示 显示带有热销标签的前4个商品 点击商品可以到商品详情
4. 分类布局(分类分为两级分类)
- 分为左右两侧
- 左侧为分类页面可以滚动
- 右侧为分类对应的二级分类以及每个二级分类下面的商品,点击分类可以到商品详情
5. 购物车布局
- 展示各家店铺下面的商品订单
6. 个人信息页面
6.1. 展示个人信息
6.2. 会员中心
- 红包 
- 优惠卷
- 积分
6.3. 我的订单
- 待付款
- 待发货
- 待收货
- 待评价
- 退款/售后
- 猜你喜欢专区

7. 登录页面
- 网站logo
- 平台名称
- 手机号 验证码 登录表单
- 登录按钮


# 这是电商小程序后台管理系统的的后端项目
# 技术栈
1. nextjs框架, react框架, ts写法
# 登录模块
1. 采用的是token认证流程,当调用了/auth/login登录接口后,后端返回token给前端,前端储存token,后续调用其他接口的时候会在请求头的header authorization 带上token数据, 后端应该拦截请求验证token的有效性,登录后,后端应该把用户的个人信息以及商户id merchantId 放在req对象中。
2. 登录后,前端调用/auth/profile,后端返回用户登录账号的详细信息, 包括用户的基本信息 avatar, email, phone, username, realName, 角色信息 roleInfo, 商户信息 merchant, 用户账号所属的角色所拥有的菜单信息 menus。
# 商户模块
1. 项目采用的是多商户的模块,分为平台超级商户和普通商户
2. 平台商户和普通商户的区别
- 拥有商户管理的权限
- 拥有操作日志和登录日志的查看的权限
3. 后续其他模块的操作都必须跟商户有关系
4. 平台超级商户在新增商户的时候默认应该给这个商户分配一个随机的超级管理员和角色,并且进行关联。
- 静态分类 增 删 查 改 都必须是在所属的商户id,也就是说静态资源分类表(resource_categories)需要额外新加一个商户id的外键,如果此时静态资源分类表没有商户id外键,应该修改数据库表新加商户id外键,并且此时现有的表里面的数据的商户id初始化为平台超级商户的id
- 菜单管理 增 删 查 改 都必须是在所属的商户id,也就是说菜单表(menus)需要额外新加一个商户id的外键,如果此时菜单表没有商户id外键,应该修改数据库表新加商户id外键,并且此时现有的表里面的数据的商户id初始化为平台超级商户的id
- 资源管理 增 删 查 改 都必须是在所属的商户id,也就是说资源管理表(resources)需要额外新加一个商户id的外键,如果此时菜单表没有商户id外键,应该修改数据库表新加商户id外键,并且此时现有的表里面的数据的商户id初始化为平台超级商户的id
- 角色管理 增 删 查 改 都必须是在所属的商户id,也就是说角色表(roles)需要额外新加一个商户id的外键,如果此时角色表没有商户id外键,应该修改数据库表新加商户id外键,并且此时现有的表里面的数据的商户id初始化为平台超级商户的id
- 用户管理 增 删 查 改 都必须是在所属的商户id,也就是说用户表(users)需要额外新加一个商户id的外键,如果此时角色表没有商户id外键,应该修改数据库表新加商户id外键,并且此时现有的表里面的数据的商户id初始化为平台超级商户的id,如果此时登录的账号说超级商户,可以查询所有用户的数据,其他商户只能查询到本账号关联的用户数据
# 权限模块(菜单模块)
1. 数据库表为menus
2. 登录账号的时候,/auth/profile接口返回所属角色的菜单数据,后端要对菜单数据进行过滤保证唯一性
3. 菜单分为三个级别, 目录级别, 菜单级别, 按钮级别
4. 目录级别, 菜单级别 显示到前端的侧边栏里面
5. 菜单级别和按钮级别需要设置权限标识,权限标识需要保证全局唯一性
6. 当访问没有权限的接口的时候,后端应该报错返回错误信息给前端,你当前没有操作权限
7. 设置按钮权限的权限标识就是为了给前端的全局自定义指令来实现隐藏和显示按钮,/auth/profile返回账号所用户的权限标识,前端通过store储存起来,然后前端通过全局自定义指令在页面的按钮代码实现按钮的显示与隐藏
8. 我希望后端可以实现一个自定义装饰器,例如以下代码的Types
```
@Get()
@Types('system:cateogry:find',{ name:"查询资源分类" })
findAll() {
  return this.categoriesService.findAll();
}
```
- Types 可以用来拦截请求判断此时登录的账号有没有这个操作权限
- Types 可以用来记录操作权限,拦截此时的操作然后把操作权限 { name:"查询资源分类" } 的操作记录到操作权限表operation_logs中
9. 注意: 新增菜单的时候名称应该保持全局唯一性
# 用户管理
1. 用户管理的所有操作都应该是基于所属的商户下面
2. 用户管理查询接口/users应该返回用户所属的商户,前端也应该正确展示商户信息
# 角色管理
1. 角色管理的所有操作都应该是基于所属的商户下面
3. 用户管理查询接口/roles应该返回用户所属的商户的角色信息
# 日志管理
1. 包括登录日志和操作日志
2. 这个模块只有平台商户才拥有的权限,/login-logs和operation-logs接口应该返回所属的商户的信息,前端也应该展示商户信息
3. 后端数据库表 登录日志(user_login_logs)和操作日志(operation_logs) 需要添加 商户id的外键 跟商户关联起来, 如果现在登录日志表和操作日志表没有商户id的相关信息,添加外建后初始化数据商户id为平台超级商户的id
4. 并且在登录日志和操作日志新增的时候记得关联上商户id

# 完成开发后你应该自行验证接口有无问题

# 当用户所属的商户被禁用的商户,改商户所有数据都不返回,包括用户 登录的时候如果用户所属的商户被禁用了,直接返回500,错误信息返回该用户所属的商户被禁用了

# 每次改动的文件都要检查有没有eslint错误和ts报错

# 品牌管理
1. 每个商品有且有一个品牌,一个品牌可以有多个商品
2. 每个商户可以建立多个品牌
3. 品牌创建完成后需要认证完成后才能在客户端上架显示
4. 品牌数据库表(brand)
- id id 是唯一自增
- merchantId 商户id
- name 品牌名称 唯一不能重复
- iconUrl 品牌icon 必填
- creatar 品牌的创建者 读取 req.user 对象
- createTime 品牌的创建时间
- updateTime 品牌的更新时间(更新完成后需要重新认证)
- status 0 禁用 1 启用
- isAuth 0 未认证 1 已认证
- isHot 0 不是热门 1 热门
- Label 是一个字符串数组 [] (类型可选: news 新品牌) 支持配置扩展
5. 接口
1.1 /brands Get 分页查询数据 权限标识 system:brands:view 分页查询登录商户的品牌 支持品牌名称 商户id 创建者等条件搜索,是否热门 分页查询登录商户的品牌(如果平台超级商户则返回所有的品牌 如果是普通商户则返回所属商户的品牌), 分页查询需要返回商户的完整信息
1.2 /brands post 新增品牌 权限标识 system:brands:add
1.3 /brands/:id put 修改品牌 权限标识 system:brands:edit
1.4 /brands/:id delete 删除品牌 权限标识 system:brands:delete
1.5 /brands/all get 查询品牌 权限标识 system:brands:viewAll 查询登录商户全部品牌
1.6 /brands/:id get 查询详情 权限标识 system:brands:details 查询品牌详情
6. 品牌后台前端页面
- 页面路径 frontend/vben-admin/apps/web-ele/src/views/system/brands/index.vue
- 页面搜索表单 商户id(select下拉组件,数据来源于/merchants/all) 品牌名称(输入框) 是否热门(select下拉)
- 表格数据(header 品牌id 品牌名称 所属商户 是否热门,品牌icon 品牌标签 创建者 状态 是否认证 操作(修改 删除))
- 新增 修改表单(品牌名称(必填),是否热门,品牌标签,品牌icon(必填))
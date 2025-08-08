# 微信小程序商城系统

## 项目简介

这是一个基于微信小程序的商城系统，包含小程序端和后台管理系统。

## 项目结构

```
cursor_shop/
├── 微信小程序商城架构文档.md          # 系统架构设计文档
├── docs/                           # 文档目录
│   └── 后台登录权限设计.md           # 后台权限系统设计
├── database/                       # 数据库相关
│   ├── schema.sql                  # 数据库表结构
│   ├── data.sql                    # 初始化数据
│   └── README.md                   # 数据库说明
└── backend/                        # 后端API服务
    ├── src/                        # 源代码
    ├── package.json                # 依赖配置
    └── README.md                   # 后端说明
```

## 技术栈

### 前端 (微信小程序)
- **框架**: Taro 3.x (React语法)
- **UI库**: Taro UI / NutUI
- **状态管理**: Redux Toolkit / Zustand
- **构建工具**: Webpack 5

### 后台管理前端
- **框架**: Vue 3 + TypeScript
- **UI库**: Ant Design Vue
- **构建工具**: Vite
- **状态管理**: Pinia

### 后端服务
- **框架**: NestJS (Node.js + TypeScript)
- **数据库**: MySQL 8.0
- **缓存**: Redis 6.2
- **认证**: Session + Cookie / JWT
- **文档**: Swagger/OpenAPI

## 核心功能

### 小程序端
- ✅ 微信授权登录
- ✅ 商品浏览 (三级分类)
- ✅ Banner轮播
- ✅ 折扣专区 & 热销专区
- ✅ 购物车管理
- ✅ 订单管理
- ✅ 用户中心

### 后台管理
- ✅ 管理员登录 (Session + Cookie)
- ✅ 权限管理 (菜单权限、路由权限、按钮权限)
- ✅ 商品管理 (热销/折扣配置)
- ✅ 分类管理 (三级分类)
- ✅ Banner管理
- ✅ 订单管理
- ✅ 用户管理
- ✅ 日志管理 (登录日志、操作日志)

## 快速开始

### 1. 数据库初始化
```bash
# 进入数据库目录
cd database

# 导入数据库结构
mysql -u root -p < schema.sql

# 导入初始化数据
mysql -u root -p < data.sql
```

### 2. 后端服务启动
```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等信息

# 启动开发服务器
npm run start:dev
```

### 3. API文档
启动后端服务后，访问：http://localhost:3000/api/v1/docs

## 系统特色

### 🔐 完善的权限系统
- **三级权限控制**: 菜单权限、路由权限、按钮权限
- **RBAC模型**: 基于角色的访问控制
- **Session认证**: 后台管理采用Session + Cookie方式

### 📊 全面的日志系统
- **登录日志**: 记录管理员登录信息、IP、设备等
- **操作日志**: 记录所有后台操作，支持审计追踪
- **系统监控**: 支持日志查询、导出、监控告警

### 🏪 单商户架构
- **简化设计**: 专注单商户场景，架构清晰
- **三级分类**: 支持商品三级分类管理
- **专区管理**: 热销专区、折扣专区展示

### 🎨 现代化界面
- **小程序**: 原生微信小程序体验
- **后台**: Vue 3 + Ant Design Vue现代化界面
- **响应式**: 支持多设备适配

## 环境配置

### 开发环境
- Node.js >= 16.0
- MySQL >= 8.0
- Redis >= 6.2
- 微信开发者工具

### 数据库配置
```sql
-- 创建数据库
CREATE DATABASE wechat_mall_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'mall_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON wechat_mall_dev.* TO 'mall_user'@'localhost';
FLUSH PRIVILEGES;
```

## 部署说明

### Docker部署
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

### 传统部署
1. 配置Nginx反向代理
2. 配置PM2进程管理
3. 配置MySQL主从复制
4. 配置Redis集群

## 开发规范

### Git工作流
- **主分支**: main (生产环境)
- **开发分支**: develop (开发环境)
- **功能分支**: feature/* (功能开发)
- **修复分支**: hotfix/* (紧急修复)

### 代码规范
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **Husky**: Git钩子
- **Commitizen**: 规范化提交

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- **项目地址**: https://gitee.com/guoruncheng_wzt/cursor_shop
- **问题反馈**: 请在Gitee上提交Issue
- **技术交流**: 欢迎Star和Fork

---

⭐ 如果这个项目对您有帮助，请给个Star支持一下！

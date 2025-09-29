# Shop Admin 商城管理系统

一个完整的电商管理系统，包含后端API和前端管理界面。

## 🏗️ 项目结构

```
cursor_shop/
├── backend/                 # 后端服务 (NestJS)
│   ├── src/                # 源代码
│   ├── database/           # 数据库相关
│   ├── uploads/            # 文件上传
│   └── docs/              # API文档
├── frontend/               # 前端项目
│   ├── h5-ecommerce/      # H5商城前端
│   ├── vben-admin/        # 管理后台 (Vue3 + Vben)
│   └── types/             # TypeScript类型定义
├── database/              # 数据库迁移文件
└── docs/                  # 项目文档
```

## 🚀 快速开始

### 后端启动

```bash
cd backend
npm install
npm run start:dev
```

### 前端启动

#### 管理后台
```bash
cd frontend/vben-admin
npm install
npm run dev
```

#### H5商城
```bash
cd frontend/h5-ecommerce
npm install
npm run dev
```

## 🛠️ 技术栈

### 后端
- **框架**: NestJS
- **数据库**: PostgreSQL/MySQL
- **ORM**: TypeORM
- **认证**: JWT
- **文档**: Swagger

### 前端
- **管理后台**: Vue 3 + Vben Admin
- **H5商城**: Vue 3 + Vant
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router

## 📝 功能特性

### 管理后台
- 🔐 用户认证与权限管理
- 📊 数据统计与分析
- 🛍️ 商品管理
- 👥 用户管理
- 📦 订单管理
- 🎨 系统配置

### H5商城
- 🏠 首页展示
- 🔍 商品搜索
- 🛒 购物车
- 💳 订单结算
- 👤 个人中心

## 🔧 开发环境

- Node.js >= 16
- npm >= 8
- 数据库 (PostgreSQL/MySQL)

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

---

**作者**: guoruncheng-web  
**仓库**: https://github.com/guoruncheng-web/shop_admin.git
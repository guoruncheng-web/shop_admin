# 快速部署指南

基于您的服务器配置的快速部署步骤。

## 服务器信息

- **IP**: `43.139.80.246`
- **部署目录**: `/www/wwwroot/shop_admin/bk_admin`
- **数据库**: MySQL (43.139.80.246:3306)
- **Redis**: 43.139.80.246:6379
- **用户**: root

## 快速开始 (5 步完成部署)

### 步骤 1: 配置 GitHub Secrets

在 GitHub 仓库中添加以下 Secrets:

```
Settings → Secrets and variables → Actions → New repository secret
```

| Secret 名称 | 值 |
|------------|-----|
| SERVER_HOST | 43.139.80.246 |
| SERVER_USER | root |
| SERVER_PORT | 22 |
| SSH_PRIVATE_KEY | (服务器上 `cat ~/.ssh/id_ed25519` 的内容) |
| REPO_URL | git@github.com:your-username/cursor_shop.git |

### 步骤 2: 在服务器上配置 SSH 密钥

```bash
# SSH 登录服务器
ssh root@43.139.80.246

# 生成 SSH 密钥 (如果还没有)
ssh-keygen -t ed25519 -C "deploy@43.139.80.246"

# 复制公钥
cat ~/.ssh/id_ed25519.pub

# 将公钥添加到 GitHub 仓库
# Settings → Deploy keys → Add deploy key → 粘贴公钥 → 勾选 "Allow write access"

# 测试连接
ssh -T git@github.com
```

### 步骤 3: 安装必要软件 (如果未安装)

```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装 PM2
npm install -g pm2

# 验证安装
node -v   # 应该是 v20.x.x
npm -v
pm2 -v
```

### 步骤 4: 配置生产环境变量

```bash
# 进入部署目录
cd /www/wwwroot/shop_admin/bk_admin

# 克隆仓库 (如果还没有)
git clone git@github.com:your-username/cursor_shop.git .

# 进入 backend 目录
cd backend

# 创建生产环境配置
nano .env.production
```

粘贴以下内容 (根据实际情况修改):

```bash
# 应用配置
NODE_ENV=production
PORT=3000
API_PREFIX=/api
API_DOCS_ENABLED=false

# 数据库配置
DATABASE_HOST=43.139.80.246
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=grc@19980713
DATABASE_NAME=wechat_mall
DATABASE_CHARSET=utf8mb4
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=false

# Redis配置
REDIS_HOST=43.139.80.246
REDIS_PORT=6379
REDIS_PASSWORD=grc@19980713
REDIS_DB=0
REDIS_TTL=3600

# Session配置 (请修改为强随机字符串)
SESSION_SECRET=change-this-to-random-string-in-production
SESSION_MAX_AGE=86400000

# JWT配置 (请修改为强随机字符串)
JWT_SECRET=change-this-to-random-string-in-production
JWT_EXPIRES_IN=7d

# 跨域配置
CORS_ORIGIN=http://localhost:8080,http://43.139.80.246:8080

# 安全配置
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=8

# 日志配置
LOG_LEVEL=info
LOG_FILE_ENABLED=true
LOG_FILE_PATH=logs/production.log

# 文件上传配置
UPLOAD_MAX_SIZE=10485760
UPLOAD_DEST=uploads/production
```

保存并退出 (Ctrl+X → Y → Enter)

### 步骤 5: 首次手动部署

```bash
# 在服务器上执行
cd /www/wwwroot/shop_admin/bk_admin/backend

# 安装依赖
npm ci

# 构建应用
npm run build

# 启动应用
pm2 start ecosystem.config.js --env production

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup

# 查看状态
pm2 status
pm2 logs wechat-mall-backend --lines 50
```

## 验证部署

```bash
# 测试 API
curl http://43.139.80.246:3000/api

# 应该返回类似: {"message":"Welcome to Wechat Mall Backend API"}
```

## 后续自动部署

完成上述步骤后，每次推送代码到 main 分支即可自动部署:

```bash
# 本地开发机器
git add .
git commit -m "feat: your changes"
git push origin main

# GitHub Actions 会自动:
# 1. 拉取代码到服务器
# 2. 安装依赖
# 3. 构建应用
# 4. 重启 PM2
# 5. 执行健康检查
```

查看部署状态: GitHub 仓库 → Actions 标签

## 常用管理命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs wechat-mall-backend

# 重启应用
pm2 restart wechat-mall-backend

# 停止应用
pm2 stop wechat-mall-backend

# 查看实时监控
pm2 monit
```

## 故障排查

### 问题 1: 端口被占用

```bash
# 查看端口占用
lsof -i :3000

# 修改 .env.production 中的 PORT
PORT=3001
```

### 问题 2: 数据库连接失败

```bash
# 测试数据库连接
mysql -h 43.139.80.246 -u root -p

# 检查数据库是否存在
SHOW DATABASES;

# 如果不存在，创建数据库
CREATE DATABASE wechat_mall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 问题 3: Redis 连接失败

```bash
# 测试 Redis 连接
redis-cli -h 43.139.80.246 -p 6379 -a grc@19980713 ping

# 应该返回 PONG
```

### 问题 4: PM2 应用崩溃

```bash
# 查看详细日志
pm2 logs wechat-mall-backend --lines 100

# 查看错误日志
cat /www/wwwroot/shop_admin/bk_admin/backend/logs/production.log
```

## 安全建议

### 1. 更改默认密钥

在 `.env.production` 中修改:

```bash
# 生成随机字符串
openssl rand -base64 32

# 使用上面生成的字符串替换
SESSION_SECRET=生成的随机字符串
JWT_SECRET=生成的随机字符串
```

### 2. 配置防火墙

```bash
# 仅开放必要端口
ufw allow 22
ufw allow 80
ufw allow 443
ufw allow 3000  # API 端口 (可选)
ufw enable
```

### 3. 定期备份数据库

```bash
# 手动备份
mysqldump -h 43.139.80.246 -u root -p wechat_mall > backup_$(date +%Y%m%d).sql

# 设置定时备份 (每天凌晨 2 点)
crontab -e
# 添加:
0 2 * * * mysqldump -h 43.139.80.246 -u root -pgrc@19980713 wechat_mall > /backups/db_$(date +\%Y\%m\%d).sql
```

## 更多信息

详细部署文档: [DEPLOYMENT.md](./DEPLOYMENT.md)

## 联系支持

如有问题,请查看:
- PM2 日志: `pm2 logs wechat-mall-backend`
- 应用日志: `/www/wwwroot/shop_admin/bk_admin/backend/logs/production.log`
- GitHub Actions: 仓库 Actions 页面

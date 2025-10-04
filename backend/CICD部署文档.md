# GitHub CI/CD 自动化部署文档

## 📋 目录

1. [概述](#概述)
2. [部署架构](#部署架构)
3. [前置准备](#前置准备)
4. [GitHub Secrets 配置](#github-secrets-配置)
5. [服务器环境配置](#服务器环境配置)
6. [CI/CD 工作流说明](#cicd-工作流说明)
7. [部署流程](#部署流程)
8. [常见问题](#常见问题)
9. [回滚策略](#回滚策略)
10. [监控和日志](#监控和日志)

---

## 概述

本项目使用 **GitHub Actions** 实现后端 NestJS 应用的自动化部署,支持:

- ✅ 自动构建和测试
- ✅ SSH 远程部署到生产服务器
- ✅ PM2 进程管理
- ✅ 零停机部署
- ✅ 部署状态验证
- ✅ 手动触发部署

### 部署方式

当前支持两种部署方式:

1. **GitHub Actions + SSH 部署** (已配置)
2. **Docker 容器化部署** (可选)

---

## 部署架构

```
┌─────────────────┐
│   开发者推送代码   │
│   git push       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   GitHub Actions        │
│   - Checkout 代码        │
│   - 安装依赖             │
│   - 运行测试             │
│   - 构建应用             │
└────────┬────────────────┘
         │
         ▼ (SSH 部署)
┌─────────────────────────┐
│   生产服务器             │
│   - 拉取最新代码         │
│   - 安装依赖             │
│   - 构建应用             │
│   - PM2 重启服务         │
└─────────────────────────┘
```

---

## 前置准备

### 1. 本地开发环境

确保以下工具已安装:

```bash
node -v    # 需要 v20.x
npm -v
git --version
```

### 2. 服务器要求

- **操作系统**: Linux (Ubuntu 20.04+ / CentOS 7+)
- **Node.js**: v20.x
- **PM2**: 最新版本
- **Git**: 已配置 SSH 密钥访问 GitHub
- **MySQL**: 8.0+
- **Redis**: 6.0+
- **端口**: 3000 (应用端口需开放)

### 3. GitHub 仓库权限

- 仓库 **Settings** → **Actions** → **General** → **Read and write permissions**

---

## GitHub Secrets 配置

进入 GitHub 仓库: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

配置以下密钥:

| 密钥名称 | 说明 | 示例值 |
|---------|------|--------|
| `SERVER_HOST` | 服务器 IP 地址 | `43.139.80.246` |
| `SERVER_USER` | SSH 用户名 | `root` 或 `www` |
| `SSH_PRIVATE_KEY` | SSH 私钥 (完整内容) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `SERVER_PORT` | SSH 端口 | `22` (默认) |

### 生成 SSH 密钥对

在**本地机器**执行:

```bash
# 生成新的 SSH 密钥对 (不设置密码)
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_key -N ""

# 查看私钥 (复制到 GitHub Secrets 的 SSH_PRIVATE_KEY)
cat ~/.ssh/github_actions_key

# 查看公钥 (需要添加到服务器)
cat ~/.ssh/github_actions_key.pub
```

### 将公钥添加到服务器

```bash
# 登录服务器
ssh root@43.139.80.246

# 添加公钥到 authorized_keys
echo "your-public-key-content" >> ~/.ssh/authorized_keys

# 设置权限
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# 验证 SSH 登录
exit
ssh -i ~/.ssh/github_actions_key root@43.139.80.246
```

---

## 服务器环境配置

### 1. Node.js 环境 (已完成)

你已经使用 nvm 安装了 Node.js v21.7.1:

```bash
# 验证当前版本
node -v  # v21.7.1
nvm current  # v21.7.1

# 如果需要切换版本
nvm use 21.7.1

# 设置默认版本
nvm alias default 21.7.1

# 如果还没安装 nvm,可以这样安装:
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
# source ~/.bashrc
# nvm install 21.7.1
```

### 2. 安装 PM2

```bash
npm install -g pm2

# 设置 PM2 开机自启
pm2 startup
pm2 save
```

### 3. 安装 MySQL 8.0

```bash
# Ubuntu
sudo apt update
sudo apt install mysql-server -y
sudo mysql_secure_installation

# 创建数据库
mysql -u root -p
CREATE DATABASE wechat_mall_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mall_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON wechat_mall_prod.* TO 'mall_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. 安装 Redis

```bash
# Ubuntu
sudo apt install redis-server -y
sudo systemctl enable redis-server
sudo systemctl start redis-server

# 验证
redis-cli ping  # 返回 PONG
```

### 5. 配置 Git SSH

```bash
# 生成服务器 SSH 密钥
ssh-keygen -t ed25519 -C "server-deploy" -N ""

# 添加公钥到 GitHub
cat ~/.ssh/id_ed25519.pub
# 复制输出,添加到 GitHub: Settings → SSH and GPG keys

# 测试连接
ssh -T git@github.com
```

### 6. 创建应用目录

```bash
# 创建应用根目录
mkdir -p /www/wwwroot/shop_admin/bk_admin
cd /www/wwwroot/shop_admin/bk_admin

# 克隆仓库 (首次部署)
git clone git@github.com:guoruncheng/shop_admin.git .
```

### 7. 配置生产环境变量

```bash
cd /www/wwwroot/shop_admin/bk_admin/backend

# 创建 .env.production 文件
vim .env.production
```

**关键配置项**:

```bash
# 应用配置
NODE_ENV=production
PORT=3000
API_PREFIX=/api
API_DOCS_ENABLED=false

# 数据库配置
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=mall_user
DATABASE_PASSWORD=your_strong_password
DATABASE_NAME=wechat_mall_prod
DATABASE_SYNCHRONIZE=false
DATABASE_LOGGING=false

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Session 配置 (生成强密钥)
SESSION_SECRET=your_session_secret_min_32_chars
SESSION_MAX_AGE=86400000

# JWT 配置
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d

# 跨域配置
CORS_ORIGIN=https://your-domain.com,https://admin.your-domain.com

# 日志配置
LOG_LEVEL=warn
LOG_FILE_ENABLED=true
LOG_FILE_PATH=logs/prod.log

# 安全配置
BCRYPT_ROUNDS=12
PASSWORD_MIN_LENGTH=8
```

**生成安全密钥**:

```bash
# 生成 SESSION_SECRET (32字符以上)
openssl rand -base64 32

# 生成 JWT_SECRET (32字符以上)
openssl rand -base64 32
```

### 8. 初始化数据库

```bash
# 导入数据库结构 (假设有 SQL 文件)
cd /www/wwwroot/shop_admin/bk_admin
mysql -u mall_user -p wechat_mall_prod < database/init.sql
```

### 9. 防火墙配置

```bash
# 开放应用端口
sudo ufw allow 3000/tcp
sudo ufw reload
sudo ufw status
```

---

## CI/CD 工作流说明

### 工作流文件位置

`.github/workflows/deploy-backend.yml`

### 触发条件

1. **自动触发**: 推送到 `main` 分支,且修改了 `backend/` 目录下的文件
2. **手动触发**: GitHub Actions 页面 → **Run workflow**

### 工作流步骤

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      1. ✅ Checkout 代码
      2. ✅ 安装 Node.js 20
      3. ✅ 安装依赖 (npm ci)
      4. ✅ 构建应用 (npm run build)
      5. ✅ 运行测试 (npm run test)
      6. ✅ SSH 部署到服务器
         - 拉取最新代码
         - 安装依赖
         - 构建应用
         - PM2 重启服务
      7. ✅ 验证部署
      8. ✅ 通知部署状态
```

### 部署脚本详解

```bash
# 设置变量
APP_NAME="wechat-mall-backend"
APP_DIR="/www/wwwroot/shop_admin/bk_admin"
REPO_URL="git@github.com:guoruncheng/shop_admin.git"

# 更新代码
cd $APP_DIR
git fetch origin
git reset --hard origin/main

# 构建应用
cd backend
npm ci --production=false
npm run build

# PM2 重启 (零停机)
pm2 reload ecosystem.config.js --env production || \
pm2 start ecosystem.config.js --env production

pm2 save
```

---

## 部署流程

### 方式一: 自动部署 (推荐)

```bash
# 1. 本地开发完成后提交代码
git add .
git commit -m "feat: 添加新功能"

# 2. 推送到 main 分支
git push origin main

# 3. GitHub Actions 自动执行部署
# 访问: https://github.com/your-username/your-repo/actions

# 4. 等待部署完成 (约 2-5 分钟)
```

### 方式二: 手动触发部署

1. 进入 GitHub 仓库
2. 点击 **Actions** 标签
3. 选择 **Deploy Backend to Production**
4. 点击 **Run workflow** → **Run workflow**

### 方式三: 服务器手动部署 (应急)

```bash
# 登录服务器
ssh root@43.139.80.246

# 进入应用目录
cd /www/wwwroot/shop_admin/bk_admin

# 拉取最新代码
git pull origin main

# 进入 backend 目录
cd backend

# 安装依赖
npm ci

# 构建应用
npm run build

# 重启服务
pm2 reload ecosystem.config.js --env production
```

---

## 常见问题

### 1. SSH 连接失败

**症状**: `Permission denied (publickey)`

**解决**:

```bash
# 确认 GitHub Secrets 中的 SSH_PRIVATE_KEY 格式正确
# 完整内容包括:
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----

# 确认服务器 authorized_keys 包含对应公钥
cat ~/.ssh/authorized_keys

# 测试本地 SSH 连接
ssh -i ~/.ssh/github_actions_key root@43.139.80.246
```

### 2. PM2 启动失败

**症状**: `Error: Cannot find module 'xxx'`

**解决**:

```bash
# 登录服务器
ssh root@43.139.80.246
cd /www/wwwroot/shop_admin/bk_admin/backend

# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart wechat-mall-backend
```

### 3. 数据库连接失败

**症状**: `ECONNREFUSED` 或 `Access denied`

**解决**:

```bash
# 检查 MySQL 运行状态
sudo systemctl status mysql

# 验证数据库用户权限
mysql -u mall_user -p
SHOW GRANTS FOR 'mall_user'@'localhost';

# 检查 .env.production 配置
cd /www/wwwroot/shop_admin/bk_admin/backend
cat .env.production | grep DATABASE
```

### 4. 端口占用

**症状**: `Port 3000 already in use`

**解决**:

```bash
# 查找占用端口的进程
lsof -i :3000

# 停止 PM2 进程
pm2 stop all
pm2 delete all

# 重新启动
pm2 start ecosystem.config.js --env production
```

### 5. 构建失败

**症状**: `Build failed` 或 `TypeScript errors`

**解决**:

```bash
# 本地验证构建
cd backend
npm run lint
npm run build
npm run test

# 修复后重新推送
git add .
git commit -m "fix: 修复构建错误"
git push origin main
```

---

## 回滚策略

### 快速回滚到上一个版本

```bash
# 登录服务器
ssh root@43.139.80.246
cd /www/wwwroot/shop_admin/bk_admin

# 查看提交历史
git log --oneline -n 10

# 回滚到指定提交
git reset --hard <commit-hash>

# 重新构建部署
cd backend
npm ci
npm run build
pm2 reload ecosystem.config.js --env production
```

### GitHub Actions 重新运行历史版本

1. 进入 **Actions** 标签
2. 选择历史成功的 workflow
3. 点击 **Re-run all jobs**

---

## 监控和日志

### PM2 监控

```bash
# 查看进程状态
pm2 status

# 查看实时日志
pm2 logs wechat-mall-backend

# 查看最近 100 行日志
pm2 logs wechat-mall-backend --lines 100

# 监控 CPU 和内存
pm2 monit

# 查看详细信息
pm2 show wechat-mall-backend
```

### 应用日志

```bash
# 应用日志目录
cd /www/wwwroot/shop_admin/bk_admin/backend/logs

# 查看生产日志
tail -f logs/prod.log

# 查看 PM2 日志
tail -f logs/pm2-error.log
tail -f logs/pm2-out.log
```

### 系统监控

```bash
# CPU 和内存
htop

# 磁盘空间
df -h

# MySQL 状态
sudo systemctl status mysql

# Redis 状态
sudo systemctl status redis-server
redis-cli info
```

---

## 安全建议

### 1. 定期更新密钥

```bash
# 每 90 天更新一次
- SESSION_SECRET
- JWT_SECRET
- 数据库密码
- Redis 密码
```

### 2. 最小权限原则

```bash
# 创建专用部署用户 (而非 root)
adduser deployer
usermod -aG sudo deployer

# 限制 SSH 访问
vim /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
```

### 3. 启用防火墙

```bash
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 3000/tcp
```

### 4. 定期备份

```bash
# MySQL 备份脚本
#!/bin/bash
BACKUP_DIR=/backup/mysql
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u mall_user -p wechat_mall_prod > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -mtime +7 -delete

# 设置定时任务
crontab -e
0 2 * * * /path/to/backup.sh
```

---

## 部署检查清单

部署前确认:

- [ ] GitHub Secrets 配置完成
- [ ] 服务器 SSH 密钥已添加
- [ ] MySQL 数据库已创建
- [ ] Redis 服务运行中
- [ ] `.env.production` 配置正确
- [ ] PM2 已安装并配置
- [ ] 防火墙规则已设置
- [ ] 域名 DNS 已解析 (如有)
- [ ] SSL 证书已配置 (如有)

首次部署:

- [ ] 运行数据库迁移
- [ ] 创建初始管理员账户
- [ ] 测试 API 接口可访问
- [ ] 验证日志正常写入
- [ ] 检查 PM2 自启动

---

## 联系和支持

如遇问题,请检查:

1. GitHub Actions 日志: `https://github.com/your-repo/actions`
2. 服务器日志: `pm2 logs wechat-mall-backend`
3. 应用日志: `/www/wwwroot/shop_admin/bk_admin/backend/logs/`

---

**最后更新时间**: 2025-10-04
**文档版本**: v1.0.0

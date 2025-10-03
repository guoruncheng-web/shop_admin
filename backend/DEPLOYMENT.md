# 部署指南 (Deployment Guide)

本指南提供了完整的 CI/CD 自动化部署方案，支持 GitHub Actions 自动部署到远程服务器。

## 目录

- [部署架构](#部署架构)
- [准备工作](#准备工作)
- [GitHub Actions 自动部署](#github-actions-自动部署)
- [手动部署](#手动部署)
- [Docker 部署](#docker-部署)
- [运维管理](#运维管理)
- [故障排查](#故障排查)

---

## 部署架构

### 技术栈
- **应用框架**: NestJS (Node.js 20)
- **进程管理**: PM2 (集群模式)
- **反向代理**: Nginx
- **数据库**: MySQL 8.0
- **缓存**: Redis 7
- **CI/CD**: GitHub Actions
- **容器化**: Docker + Docker Compose (可选)

### 部署流程
```
GitHub Push → GitHub Actions → SSH 部署 → 构建 → PM2 重启 → 健康检查
```

---

## 准备工作

### 1. 服务器要求

**最低配置**:
- CPU: 2核
- 内存: 4GB
- 磁盘: 20GB
- 操作系统: Ubuntu 20.04+ / Debian 11+

**已知服务器信息**:
- IP: `43.139.80.246`
- 部署目录: `/www/wwwroot/shop_admin/bk_admin`
- 数据库: MySQL (端口 3306)
- Redis: (端口 6379)

### 2. 服务器初始化

在服务器上执行初始化脚本:

```bash
# 上传脚本到服务器
scp backend/scripts/deployment/setup-server.sh root@43.139.80.246:/tmp/

# 在服务器上执行
ssh root@43.139.80.246
chmod +x /tmp/setup-server.sh
sudo /tmp/setup-server.sh
```

脚本将自动安装:
- ✅ Node.js 20
- ✅ PM2
- ✅ MySQL 8.0
- ✅ Redis
- ✅ Nginx
- ✅ 配置防火墙
- ✅ 创建部署用户

### 3. 配置 SSH 密钥

**在服务器上生成 SSH 密钥**:
```bash
ssh root@43.139.80.246
ssh-keygen -t ed25519 -C "deploy@43.139.80.246"
cat ~/.ssh/id_ed25519.pub
```

**将公钥添加到 GitHub**:
1. 复制上面的公钥内容
2. 前往 GitHub 仓库 → Settings → Deploy keys
3. 点击 "Add deploy key"
4. 粘贴公钥，勾选 "Allow write access"

**测试 SSH 连接**:
```bash
ssh -T git@github.com
```

### 4. 配置 GitHub Secrets

在 GitHub 仓库中配置以下 Secrets:

进入 **Settings → Secrets and variables → Actions → New repository secret**:

| Secret Name | 值 | 说明 |
|------------|-----|------|
| `SERVER_HOST` | `43.139.80.246` | 服务器 IP |
| `SERVER_USER` | `root` 或 `deploy` | SSH 用户名 |
| `SERVER_PORT` | `22` | SSH 端口 |
| `SSH_PRIVATE_KEY` | 私钥内容 | 服务器 SSH 私钥 |
| `REPO_URL` | `git@github.com:your-username/cursor_shop.git` | Git 仓库地址 |

**获取 SSH 私钥**:
```bash
ssh root@43.139.80.246
cat ~/.ssh/id_ed25519  # 复制完整内容到 SSH_PRIVATE_KEY
```

### 5. 配置生产环境变量

在服务器上创建 `.env.production` 文件:

```bash
ssh root@43.139.80.246
cd /www/wwwroot/shop_admin/bk_admin/backend
nano .env.production
```

配置示例:
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

# Session配置
SESSION_SECRET=your-super-secret-session-key-change-in-production
SESSION_MAX_AGE=86400000

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# 跨域配置
CORS_ORIGIN=https://your-frontend-domain.com,https://admin.yourdomain.com

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

---

## GitHub Actions 自动部署

### 工作流配置

已创建的 GitHub Actions 工作流文件:
```
.github/workflows/deploy-backend.yml
```

### 触发条件

- **自动触发**: 推送到 `main` 分支，且修改了 `backend/` 目录下的文件
- **手动触发**: 在 GitHub Actions 页面手动运行

### 部署步骤

1. **推送代码到 main 分支**:
   ```bash
   git add .
   git commit -m "feat: update backend code"
   git push origin main
   ```

2. **查看部署进度**:
   - 前往 GitHub 仓库
   - 点击 "Actions" 标签
   - 查看最新的工作流运行状态

3. **部署成功后**:
   - ✅ 代码已拉取到服务器
   - ✅ 依赖已安装
   - ✅ 应用已构建
   - ✅ PM2 已重启应用
   - ✅ 健康检查通过

### 手动触发部署

在 GitHub Actions 页面:
1. 点击 "Deploy Backend to Production" 工作流
2. 点击 "Run workflow"
3. 选择分支
4. 点击 "Run workflow" 按钮

---

## 手动部署

如果不使用 GitHub Actions，可以使用部署脚本手动部署。

### 方式一: 使用部署脚本

```bash
# 在服务器上执行
ssh root@43.139.80.246
cd /www/wwwroot/shop_admin/bk_admin
bash backend/scripts/deployment/deploy.sh
```

### 方式二: 逐步部署

```bash
# 1. SSH 连接到服务器
ssh root@43.139.80.246

# 2. 进入项目目录
cd /www/wwwroot/shop_admin/bk_admin

# 3. 拉取最新代码
git pull origin main

# 4. 进入 backend 目录
cd backend

# 5. 安装依赖
npm ci

# 6. 构建应用
npm run build

# 7. 重启 PM2
pm2 reload ecosystem.config.js --env production

# 8. 查看状态
pm2 status
pm2 logs wechat-mall-backend --lines 50
```

---

## Docker 部署

### 方式一: Docker Compose (推荐)

**启动所有服务** (Backend + MySQL + Redis + Nginx):

```bash
# 1. 创建 .env 文件
cp backend/.env.example backend/.env.production

# 2. 编辑环境变量
nano backend/.env.production

# 3. 启动所有服务
cd backend
docker-compose up -d

# 4. 查看日志
docker-compose logs -f backend

# 5. 查看状态
docker-compose ps
```

**常用命令**:
```bash
# 停止服务
docker-compose down

# 重启服务
docker-compose restart backend

# 查看日志
docker-compose logs -f backend

# 进入容器
docker-compose exec backend sh

# 重新构建并启动
docker-compose up -d --build
```

### 方式二: 仅 Docker (不含数据库)

```bash
# 构建镜像
cd backend
docker build -t wechat-mall-backend .

# 运行容器
docker run -d \
  --name wechat-mall-backend \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  wechat-mall-backend

# 查看日志
docker logs -f wechat-mall-backend

# 停止容器
docker stop wechat-mall-backend

# 启动容器
docker start wechat-mall-backend
```

---

## 运维管理

### PM2 常用命令

```bash
# 查看应用状态
pm2 status

# 查看实时日志
pm2 logs wechat-mall-backend

# 查看最近 100 行日志
pm2 logs wechat-mall-backend --lines 100

# 重启应用
pm2 restart wechat-mall-backend

# 重载应用 (0 停机时间)
pm2 reload wechat-mall-backend

# 停止应用
pm2 stop wechat-mall-backend

# 启动应用
pm2 start ecosystem.config.js --env production

# 删除应用
pm2 delete wechat-mall-backend

# 监控应用
pm2 monit

# 保存进程列表
pm2 save

# 清空日志
pm2 flush
```

### Nginx 管理

```bash
# 测试配置文件
sudo nginx -t

# 重载配置
sudo nginx -s reload

# 重启 Nginx
sudo systemctl restart nginx

# 查看状态
sudo systemctl status nginx

# 查看日志
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 数据库管理

```bash
# 连接 MySQL
mysql -h 43.139.80.246 -u root -p

# 备份数据库
mysqldump -h 43.139.80.246 -u root -p wechat_mall > backup_$(date +%Y%m%d).sql

# 恢复数据库
mysql -h 43.139.80.246 -u root -p wechat_mall < backup_20250104.sql

# 查看数据库状态
mysql -h 43.139.80.246 -u root -p -e "SHOW PROCESSLIST;"
```

### 日志管理

```bash
# 查看应用日志
tail -f /www/wwwroot/shop_admin/bk_admin/backend/logs/production.log

# 查看 PM2 日志
pm2 logs --lines 100

# 清理旧日志
find /www/wwwroot/shop_admin/bk_admin/backend/logs -name "*.log" -mtime +30 -delete
```

### 版本回滚

```bash
# 使用回滚脚本
ssh root@43.139.80.246
cd /www/wwwroot/shop_admin/bk_admin
bash backend/scripts/deployment/rollback.sh

# 手动回滚到上一次提交
git reset --hard HEAD~1
npm ci
npm run build
pm2 reload ecosystem.config.js --env production
```

---

## 故障排查

### 1. 应用无法启动

**检查日志**:
```bash
pm2 logs wechat-mall-backend --lines 100
```

**常见问题**:
- ❌ 端口被占用 → 修改 `.env.production` 中的 `PORT`
- ❌ 数据库连接失败 → 检查 `DATABASE_*` 配置
- ❌ Redis 连接失败 → 检查 `REDIS_*` 配置

### 2. 数据库连接失败

```bash
# 测试数据库连接
mysql -h 43.139.80.246 -u root -p -e "SELECT 1;"

# 检查数据库是否存在
mysql -h 43.139.80.246 -u root -p -e "SHOW DATABASES;"

# 检查 MySQL 状态
sudo systemctl status mysql
```

### 3. Redis 连接失败

```bash
# 测试 Redis 连接
redis-cli -h 43.139.80.246 -p 6379 -a grc@19980713 ping

# 检查 Redis 状态
sudo systemctl status redis-server
```

### 4. Nginx 502 错误

```bash
# 检查后端是否运行
pm2 status

# 检查端口是否监听
netstat -tuln | grep 3000

# 测试后端 API
curl http://localhost:3000/api

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log
```

### 5. GitHub Actions 部署失败

**SSH 连接失败**:
- 检查 `SERVER_HOST`, `SERVER_USER`, `SERVER_PORT` 是否正确
- 检查 `SSH_PRIVATE_KEY` 是否完整（包含开头和结尾）

**权限问题**:
```bash
# 在服务器上确保部署目录有正确权限
sudo chown -R deploy:deploy /www/wwwroot/shop_admin/bk_admin
sudo chmod -R 755 /www/wwwroot/shop_admin/bk_admin
```

### 6. 内存不足

```bash
# 查看内存使用
free -h

# 查看 PM2 进程内存
pm2 monit

# 减少 PM2 实例数量
# 编辑 ecosystem.config.js
instances: 2  # 从 'max' 改为固定数量
```

---

## 性能优化

### 1. 启用 Nginx Gzip 压缩

已在 `nginx/nginx.conf` 中配置 Gzip 压缩。

### 2. 配置 PM2 集群模式

已在 `ecosystem.config.js` 中配置集群模式:
```javascript
instances: 'max',  // 使用所有 CPU 核心
exec_mode: 'cluster'
```

### 3. 数据库连接池

在 `src/config/configuration.ts` 中调整:
```typescript
extra: {
  connectionLimit: 10,  // 连接池大小
}
```

### 4. Redis 缓存优化

配置 Redis 持久化和内存策略。

---

## 安全建议

### 1. 更改默认密码

```bash
# 更改 Session Secret
SESSION_SECRET=使用强随机字符串

# 更改 JWT Secret
JWT_SECRET=使用强随机字符串

# 更改数据库密码
DATABASE_PASSWORD=使用强密码

# 更改 Redis 密码
REDIS_PASSWORD=使用强密码
```

### 2. 配置 HTTPS

使用 Let's Encrypt 免费证书:
```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 申请证书
sudo certbot --nginx -d api.yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

### 3. 配置防火墙

```bash
# 仅开放必要端口
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 4. 定期备份

创建自动备份任务:
```bash
# 添加到 crontab
0 2 * * * /usr/bin/mysqldump -h 43.139.80.246 -u root -pgrc@19980713 wechat_mall > /backups/db_$(date +\%Y\%m\%d).sql
```

---

## 监控和告警

### 1. PM2 监控

```bash
# 安装 PM2 Plus (可选)
pm2 install pm2-server-monit
```

### 2. 日志监控

使用 `logrotate` 自动轮转日志:
```bash
sudo nano /etc/logrotate.d/wechat-mall
```

### 3. 健康检查

设置健康检查 Cron 任务:
```bash
# 每 5 分钟检查一次
*/5 * * * * curl -f http://localhost:3000/api || systemctl restart pm2-root
```

---

## 总结

### 部署清单

- [x] 服务器初始化
- [x] 安装 Node.js, PM2, MySQL, Redis, Nginx
- [x] 配置 SSH 密钥
- [x] 配置 GitHub Secrets
- [x] 配置生产环境变量
- [x] 配置 Nginx 反向代理
- [x] 推送代码触发自动部署
- [x] 验证部署成功

### 支持的部署方式

1. ✅ **GitHub Actions 自动部署** (推荐)
2. ✅ **手动脚本部署**
3. ✅ **Docker Compose 部署**
4. ✅ **Docker 容器部署**

### 技术支持

如有问题，请查看:
- 应用日志: `pm2 logs wechat-mall-backend`
- Nginx 日志: `/var/log/nginx/error.log`
- MySQL 日志: `/var/log/mysql/error.log`
- GitHub Actions 日志: 仓库 Actions 页面

---

**部署完成后访问**:
- API 文档: `http://43.139.80.246:3000/api/docs` (开发环境)
- API 接口: `http://43.139.80.246:3000/api`
- 健康检查: `http://43.139.80.246:3000/api`

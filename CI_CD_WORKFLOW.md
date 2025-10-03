# CI/CD 自动部署流程详解

## 流程概览

```
本地推送代码 → GitHub → GitHub Actions → 服务器部署 → 应用重启 → 验证
```

---

## 触发条件

### 自动触发
当满足以下**任一条件**时自动触发部署:

1. **推送到 main 分支** 且修改了 `backend/**` 目录下的文件
2. **推送到 main 分支** 且修改了 `.github/workflows/deploy-backend.yml` 文件

示例:
```bash
git add backend/src/main.ts
git commit -m "feat: update main.ts"
git push origin main
# ✅ 会触发自动部署

git add frontend/README.md
git commit -m "docs: update frontend readme"
git push origin main
# ❌ 不会触发部署 (没修改 backend/)
```

### 手动触发
在 GitHub Actions 页面点击 "Run workflow" 按钮手动触发。

---

## 完整部署流程 (分 3 个阶段)

### 📦 阶段 1: GitHub Actions 环境准备 (在 GitHub 服务器执行)

#### Step 1: Checkout code
```yaml
- name: Checkout code
  uses: actions/checkout@v4
```
**作用**: 拉取您的 GitHub 仓库代码到 GitHub Actions 运行环境

---

#### Step 2: Setup Node.js
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
```
**作用**: 安装 Node.js 20 并启用 npm 缓存加速

---

#### Step 3: Install dependencies
```yaml
- name: Install dependencies
  working-directory: ./backend
  run: npm ci
```
**作用**: 安装后端依赖包 (在 GitHub Actions 环境)
**命令**: `npm ci` (比 `npm install` 更快更可靠)

---

#### Step 4: Build application
```yaml
- name: Build application
  working-directory: ./backend
  run: npm run build
```
**作用**: 将 TypeScript 编译为 JavaScript
**输出**: `backend/dist/` 目录 (编译后的生产代码)

---

#### Step 5: Run tests
```yaml
- name: Run tests
  working-directory: ./backend
  run: npm run test
```
**作用**: 运行单元测试，确保代码质量
**失败处理**: 如果测试失败，整个部署流程中断 ❌

---

### 🚀 阶段 2: 部署到生产服务器 (通过 SSH 连接到您的服务器执行)

#### Step 6: Deploy to Server via SSH

**SSH 连接信息**:
- Host: `43.139.80.246` (从 GitHub Secrets 读取)
- User: `root`
- Auth: SSH 私钥认证 (从 GitHub Secrets 读取)

**在服务器上执行的脚本**:

##### 6.1 创建应用目录
```bash
mkdir -p /www/wwwroot/shop_admin/bk_admin
cd /www/wwwroot/shop_admin/bk_admin
```

##### 6.2 拉取最新代码
```bash
if [ -d ".git" ]; then
  # 如果已经克隆过仓库，拉取最新代码
  git fetch origin
  git reset --hard origin/main
else
  # 首次部署，克隆仓库
  git clone git@github.com:your-username/cursor_shop.git .
fi
```

##### 6.3 安装依赖
```bash
cd backend
npm ci --production=false
```
**注意**: `--production=false` 会安装 devDependencies (因为需要 TypeScript 编译器)

##### 6.4 构建应用
```bash
npm run build
```
**生成**: `/www/wwwroot/shop_admin/bk_admin/backend/dist/` 目录

##### 6.5 检查环境变量文件
```bash
if [ ! -f .env.production ]; then
  cp .env.example .env.production
  echo "⚠️  Please update .env.production!"
fi
```
**首次部署**: 会创建 `.env.production` 模板文件
**后续部署**: 保留现有的 `.env.production` (不会覆盖)

##### 6.6 使用 PM2 重启应用
```bash
pm2 reload ecosystem.config.js --env production || \
pm2 start ecosystem.config.js --env production
```

**逻辑**:
- 如果应用已在运行 → `pm2 reload` (0 停机时间热重启)
- 如果应用未运行 → `pm2 start` (首次启动)

**PM2 配置** (从 `ecosystem.config.js` 读取):
- 应用名: `wechat-mall-backend`
- 运行模式: `cluster` (集群模式)
- 实例数: `max` (使用所有 CPU 核心)
- 入口文件: `dist/main.js`

##### 6.7 保存 PM2 进程列表
```bash
pm2 save
```
**作用**: 保存进程列表，确保服务器重启后应用自动启动

---

### ✅ 阶段 3: 验证部署

#### Step 7: Verify deployment

**在服务器上执行**:

##### 7.1 检查 PM2 状态
```bash
pm2 status
```
**预期输出**:
```
┌────┬────────────────────────┬──────────┬──────┬───────────┬──────────┐
│ id │ name                   │ mode     │ ↺    │ status    │ cpu      │
├────┼────────────────────────┼──────────┼──────┼───────────┼──────────┤
│ 0  │ wechat-mall-backend    │ cluster  │ 0    │ online    │ 0%       │
└────┴────────────────────────┴──────────┴──────┴───────────┴──────────┘
```

##### 7.2 查看应用日志
```bash
pm2 logs wechat-mall-backend --lines 20 --nostream
```
**查看**: 最近 20 行应用日志，检查是否有错误

---

#### Step 8: Notify deployment status

```bash
if [ ${{ job.status }} == 'success' ]; then
  echo "✅ Deployment successful!"
else
  echo "❌ Deployment failed!"
fi
```

**结果通知**: 在 GitHub Actions 页面显示部署结果

---

## 完整时间线示例

### 场景: 修改代码并推送

```bash
# 本地修改代码
vim backend/src/main.ts

# 提交并推送
git add .
git commit -m "feat: update port to 3000"
git push origin main
```

**GitHub Actions 自动执行**:

| 时间 | 阶段 | 操作 | 耗时 |
|------|------|------|------|
| 00:00 | 触发 | 检测到 main 分支推送 | 即时 |
| 00:05 | 准备 | 拉取代码 + 安装 Node.js | ~10s |
| 00:15 | 构建 | 安装依赖 | ~30s |
| 00:45 | 构建 | TypeScript 编译 | ~15s |
| 01:00 | 测试 | 运行单元测试 | ~20s |
| 01:20 | 部署 | SSH 连接服务器 | ~5s |
| 01:25 | 部署 | Git pull 最新代码 | ~10s |
| 01:35 | 部署 | 服务器安装依赖 | ~40s |
| 02:15 | 部署 | 服务器构建应用 | ~15s |
| 02:30 | 部署 | PM2 重启应用 | ~5s |
| 02:35 | 验证 | 检查应用状态 | ~5s |
| 02:40 | 完成 | ✅ 部署成功 | - |

**总耗时**: 约 2-3 分钟

---

## 部署架构图

```
┌─────────────────┐
│   开发者本地    │
│  git push main  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│              GitHub 平台                        │
│  ┌─────────────────────────────────────────┐   │
│  │       GitHub Actions Runner             │   │
│  │  1. Checkout 代码                       │   │
│  │  2. 安装 Node.js 20                     │   │
│  │  3. npm ci (安装依赖)                   │   │
│  │  4. npm run build (编译)                │   │
│  │  5. npm run test (测试)                 │   │
│  └────────────────┬────────────────────────┘   │
│                   │                             │
└───────────────────┼─────────────────────────────┘
                    │ SSH 连接
                    ▼
┌─────────────────────────────────────────────────┐
│          生产服务器 (43.139.80.246)            │
│  ┌─────────────────────────────────────────┐   │
│  │  /www/wwwroot/shop_admin/bk_admin       │   │
│  │                                          │   │
│  │  1. git pull (拉取代码)                 │   │
│  │  2. npm ci (安装依赖)                   │   │
│  │  3. npm run build (编译)                │   │
│  │  4. pm2 reload (重启应用)               │   │
│  │                                          │   │
│  │  ┌──────────────────────────────┐       │   │
│  │  │   PM2 进程管理器             │       │   │
│  │  │  ┌────────────────────────┐  │       │   │
│  │  │  │ wechat-mall-backend    │  │       │   │
│  │  │  │ (Cluster Mode)         │  │       │   │
│  │  │  │  - Instance 1 (3000)   │  │       │   │
│  │  │  │  - Instance 2 (3000)   │  │       │   │
│  │  │  │  - Instance N...       │  │       │   │
│  │  │  └────────────────────────┘  │       │   │
│  │  └──────────────────────────────┘       │   │
│  └─────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
                    │
                    ▼
              ┌──────────┐
              │  用户访问 │
              │  :3000    │
              └──────────┘
```

---

## 关键特性

### 1. 零停机部署 (Zero Downtime)
- 使用 `pm2 reload` 而不是 `pm2 restart`
- 集群模式下逐个重启实例
- 确保始终有实例在运行

### 2. 自动回滚机制
- Git 使用 `reset --hard origin/main`
- 如果构建失败，PM2 会保持旧版本运行
- 可以使用 `rollback.sh` 脚本手动回滚

### 3. 环境隔离
- GitHub Actions 环境 (测试、构建)
- 生产服务器环境 (运行)
- 互不干扰

### 4. 安全性
- SSH 密钥认证 (不使用密码)
- GitHub Secrets 加密存储敏感信息
- .env.production 不会被覆盖

---

## 常见问题

### Q1: 部署会中断正在处理的请求吗?

**答**: 不会。PM2 的 `reload` 会等待旧进程处理完当前请求后再关闭。

---

### Q2: 如果部署失败会怎样?

**答**:
- GitHub Actions 阶段失败 → 不会触发服务器部署
- 服务器构建失败 → PM2 保持运行旧版本
- PM2 启动失败 → 可以查看日志并手动修复

---

### Q3: 可以回滚到之前的版本吗?

**答**: 可以，有 3 种方式:
1. 使用 `backend/scripts/deployment/rollback.sh` 脚本
2. 手动 `git reset --hard <commit-hash>` 并重新部署
3. 在 GitHub 上 revert 提交并推送

---

### Q4: 如何查看部署日志?

**答**:
- **GitHub Actions 日志**: GitHub 仓库 → Actions 标签
- **应用日志**: `ssh root@43.139.80.246 'pm2 logs wechat-mall-backend'`
- **系统日志**: `/www/wwwroot/shop_admin/bk_admin/backend/logs/production.log`

---

### Q5: 可以部署到多个环境吗?

**答**: 可以，创建不同的 workflow 文件:
- `deploy-staging.yml` → 部署到测试环境
- `deploy-production.yml` → 部署到生产环境
- 使用不同的分支触发 (如 `staging` 和 `main`)

---

## 监控和告警

### 查看实时部署状态

```bash
# 方法 1: GitHub Actions 页面
# 访问仓库 → Actions → 点击最新的 workflow run

# 方法 2: GitHub CLI
gh run list --workflow=deploy-backend.yml
gh run view <run-id> --log

# 方法 3: SSH 到服务器查看
ssh root@43.139.80.246 'pm2 monit'
```

### 设置部署通知

可以在 workflow 中添加通知步骤:
- Slack 通知
- 邮件通知
- 钉钉/企业微信通知

---

## 优化建议

### 1. 缓存优化
GitHub Actions 已启用 npm 缓存，加快依赖安装速度。

### 2. 并行测试
如果测试较多，可以配置并行测试:
```yaml
- name: Run tests
  run: npm run test -- --maxWorkers=4
```

### 3. 分阶段部署
先部署到测试环境，验证通过后再部署到生产环境。

### 4. 健康检查
添加应用健康检查端点:
```typescript
@Get('health')
healthCheck() {
  return { status: 'ok', timestamp: Date.now() };
}
```

---

## 总结

**CI/CD 流程**: `代码推送 → 自动构建 → 自动测试 → 自动部署 → 自动验证`

**优势**:
- ✅ 全自动化，无需手动操作
- ✅ 零停机部署
- ✅ 构建和测试失败自动中断
- ✅ 环境配置统一管理
- ✅ 部署历史可追溯

**下一步**: 参考 [QUICK_DEPLOY.md](backend/QUICK_DEPLOY.md) 完成首次部署配置。

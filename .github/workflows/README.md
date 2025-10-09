# CI/CD 配置说明

## 工作流文件

### 1. deploy-frontend.yml
自动部署前端 (Vben Admin) 到服务器 `/home/docker/nginx/html`

**触发条件:**
- 推送到 `main` 分支且修改了 `frontend/vben-admin/**` 目录
- 手动触发 (workflow_dispatch)

**部署流程:**
1. 检出代码
2. 安装 pnpm 和 Node.js 20.10.0
3. 安装依赖并构建 `web-ele` 应用
4. 通过 SCP 上传构建产物到服务器
5. SSH 执行部署脚本 (备份旧版本 → 部署新版本 → 清理)
6. 验证部署结果

### 2. deploy-backend.yml
自动部署后端 (NestJS) 到服务器

**触发条件:**
- 推送到 `main` 分支且修改了 `backend/**` 目录
- 手动触发 (workflow_dispatch)

**部署流程:**
1. 构建后端应用
2. 上传到服务器 `/www/wwwroot/shop_admin/bk_admin/backend`
3. 使用 PM2 重启服务

## GitHub Secrets 配置

需要在 GitHub 仓库设置以下 Secrets:

### 服务器连接配置
```
SERVER_HOST=43.139.80.246          # 服务器 IP 地址
SERVER_USER=root                    # SSH 用户名 (通常为 root)
SERVER_PORT=22                      # SSH 端口 (默认 22)
SSH_PRIVATE_KEY=<你的私钥内容>      # SSH 私钥 (完整内容)
```

### 后端环境变量
```
ENV_PRODUCTION=<.env.production 文件内容>
```

## 配置 GitHub Secrets 步骤

### 1. 生成 SSH 密钥对 (如果没有)

在本地执行:
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions_rsa
```

### 2. 将公钥添加到服务器

```bash
# 复制公钥到服务器
ssh-copy-id -i ~/.ssh/github_actions_rsa.pub root@43.139.80.246

# 或手动添加
cat ~/.ssh/github_actions_rsa.pub | ssh root@43.139.80.246 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### 3. 测试 SSH 连接

```bash
ssh -i ~/.ssh/github_actions_rsa root@43.139.80.246
```

### 4. 在 GitHub 添加 Secrets

前往仓库: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

添加以下 Secrets:

#### SERVER_HOST
```
43.139.80.246
```

#### SERVER_USER
```
root
```

#### SERVER_PORT
```
22
```

#### SSH_PRIVATE_KEY
```bash
# 复制私钥完整内容
cat ~/.ssh/github_actions_rsa
```
将输出的完整内容 (包括 `-----BEGIN ... KEY-----` 和 `-----END ... KEY-----`) 粘贴到 Secret 中

#### ENV_PRODUCTION (后端环境变量)
复制 `backend/.env.production` 文件的完整内容

## 部署目录结构

### 前端部署目录
```
/home/docker/nginx/html/          # Nginx 静态文件目录
├── index.html
├── assets/
└── ...

/home/docker/nginx/html_backup_*  # 自动备份 (保留最近3个)
```

### 后端部署目录
```
/www/wwwroot/shop_admin/bk_admin/backend/
├── dist/                          # 编译后的代码
├── node_modules/                  # 生产依赖
├── .env.production                # 环境变量
├── package.json
└── ecosystem.config.js            # PM2 配置
```

## 手动触发部署

### GitHub Web 界面
1. 进入仓库 `Actions` 页面
2. 选择要运行的工作流 (deploy-frontend 或 deploy-backend)
3. 点击 `Run workflow` → 选择分支 → `Run workflow`

### GitHub CLI
```bash
# 部署前端
gh workflow run deploy-frontend.yml

# 部署后端
gh workflow run deploy-backend.yml
```

## 常见问题

### 1. 部署失败: Permission denied
- 检查 SSH 私钥是否正确配置
- 确认公钥已添加到服务器 `~/.ssh/authorized_keys`
- 验证服务器 SSH 端口是否正确

### 2. 前端部署后 404
- 确认 Nginx 配置中 root 路径为 `/home/docker/nginx/html`
- 检查文件权限: `chmod -R 755 /home/docker/nginx/html`
- 重启 Nginx 容器: `docker restart nginx`

### 3. 后端部署后服务未启动
- SSH 到服务器检查 PM2 状态: `pm2 status`
- 查看应用日志: `pm2 logs wechat-mall-backend`
- 手动重启: `pm2 restart wechat-mall-backend`

## 访问地址

部署成功后访问:
- **前端**: http://www.livegrc.chat
- **后端 API**: http://www.livegrc.chat/api
- **API 文档**: http://www.livegrc.chat/api/docs

## 回滚操作

### 前端回滚
```bash
# SSH 到服务器
ssh root@43.139.80.246

# 查看备份
ls -lh /home/docker/nginx/html_backup_*

# 回滚到指定备份
cp -r /home/docker/nginx/html_backup_20250109_120000/* /home/docker/nginx/html/
```

### 后端回滚
使用 Git 回滚后重新触发部署,或在服务器上手动切换代码版本

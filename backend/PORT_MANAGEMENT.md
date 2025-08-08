# 端口管理指南

## 🔧 端口占用问题解决

### 问题描述
启动NestJS应用时遇到端口被占用错误：
```
Error: listen EADDRINUSE: address already in use :::3000
```

### 解决方案

#### 1. 查找占用端口的进程
```bash
# 查找占用3000端口的进程ID
lsof -ti:3000

# 查看进程详情
ps aux | grep <进程ID>
```

#### 2. 关闭占用端口的进程
```bash
# 优雅关闭
kill <进程ID>

# 强制关闭 (如果优雅关闭无效)
kill -9 <进程ID>
```

#### 3. 验证端口释放
```bash
# 检查端口是否已释放
lsof -ti:3000
# 如果没有输出，说明端口已释放
```

#### 4. 重新启动应用
```bash
npm run start:dev
```

## 📊 常用端口管理命令

### 查看端口占用
```bash
# 查看特定端口占用
lsof -i:3000

# 查看所有端口占用
netstat -tulpn | grep LISTEN

# 查看进程详情
ps aux | grep <进程名>
```

### 批量关闭进程
```bash
# 关闭所有Node.js进程
pkill -f node

# 关闭所有NestJS进程
pkill -f "nest start"

# 关闭特定端口的进程
kill -9 $(lsof -ti:3000)
```

### 端口扫描
```bash
# 扫描常用端口
nmap localhost

# 扫描特定端口范围
nmap -p 3000-3010 localhost
```

## 🎯 预防措施

### 1. 使用不同端口
在 `.env.development` 中配置不同端口：
```env
PORT=3001
```

### 2. 启动前检查
```bash
# 检查端口是否可用
lsof -i:3000 || echo "Port 3000 is available"

# 如果端口被占用，自动关闭
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
```

### 3. 使用启动脚本
创建启动脚本自动处理端口问题：
```bash
#!/bin/bash
# 关闭可能占用端口的进程
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# 启动应用
npm run start:dev
```

## 🚀 快速解决方案

### 一键关闭3000端口
```bash
kill -9 $(lsof -ti:3000) 2>/dev/null || echo "Port 3000 is already free"
```

### 一键重启应用
```bash
# 关闭旧进程并启动新进程
kill -9 $(lsof -ti:3000) 2>/dev/null; npm run start:dev
```

## 📋 常见端口冲突

| 服务 | 默认端口 | 解决方案 |
|------|----------|----------|
| Next.js | 3000 | 使用3001或其他端口 |
| React | 3000 | 使用3001或其他端口 |
| Vue | 8080 | 使用8081或其他端口 |
| Angular | 4200 | 使用4201或其他端口 |
| NestJS | 3000 | 使用3001或其他端口 |

## ✅ 当前状态

- ✅ **3000端口**: 已释放
- ✅ **NestJS服务器**: 正常运行
- ✅ **API服务**: 可访问
- ✅ **端口管理**: 问题已解决

---

**现在您的应用可以正常运行了！**

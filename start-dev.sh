#!/bin/bash

echo "🚀 启动微信小程序商城后台管理系统..."

# 启动后端服务
echo "📦 启动后端服务..."
cd backend
npm run start:dev &
BACKEND_PID=$!

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 5

# 启动前端服务
echo "🖥️  启动前端服务..."
cd ../admin
pnpm dev &
FRONTEND_PID=$!

echo "✅ 服务启动完成！"
echo "📱 后端API: http://localhost:3000"
echo "🖥️  前端管理: http://localhost:5173"
echo "🔧 按 Ctrl+C 停止所有服务"

# 捕获Ctrl+C信号
trap "echo '正在停止所有服务...'; kill $BACKEND_PID $FRONTEND_PID; exit 0" INT

# 等待所有子进程
wait
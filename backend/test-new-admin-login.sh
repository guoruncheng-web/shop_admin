#!/bin/bash

API_URL="http://localhost:3000/api"

# 从上次创建的商户获取超级管理员账号
ADMIN_USERNAME="admin_ic0qxa2b"
ADMIN_PASSWORD="GYO^ozajRlV8"

echo "🔐 测试新创建的超级管理员登录..."
echo "   用户名: $ADMIN_USERNAME"
echo "   密码: $ADMIN_PASSWORD"
echo ""

echo "1️⃣  获取验证码..."
CAPTCHA_RESPONSE=$(curl -s "${API_URL}/auth/captcha")
CAPTCHA_ID=$(echo $CAPTCHA_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['captchaId'])")

CAPTCHA_DEBUG=$(curl -s "${API_URL}/auth/captcha/debug")
CAPTCHA_TEXT=$(echo $CAPTCHA_DEBUG | python3 -c "import sys, json; data=json.load(sys.stdin); print([c['text'] for c in data['data'] if c['id']=='$CAPTCHA_ID'][0] if data['data'] else '')")

echo "2️⃣  使用新管理员账号登录..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$ADMIN_USERNAME\",
    \"password\": \"$ADMIN_PASSWORD\",
    \"captchaId\": \"$CAPTCHA_ID\",
    \"captcha\": \"$CAPTCHA_TEXT\"
  }")

echo "$LOGIN_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('code') == 200:
    print('✅ 登录成功!')
    user = data.get('data', {}).get('user', {})
    print(f'   用户ID: {user.get(\"userId\")}')
    print(f'   用户名: {user.get(\"username\")}')
    print(f'   真实姓名: {user.get(\"realName\")}')
    print(f'   邮箱: {user.get(\"email\")}')
    print(f'   商户ID: {user.get(\"merchantId\")}')
    print('')
    merchant = user.get('merchant', {})
    if merchant:
        print('   所属商户:')
        print(f'     商户名称: {merchant.get(\"merchantName\")}')
        print(f'     商户编码: {merchant.get(\"merchantCode\")}')
        print(f'     商户类型: {merchant.get(\"merchantType\")}')
else:
    print('❌ 登录失败')
    print(f'   错误: {data.get(\"msg\", \"未知错误\")}')
"

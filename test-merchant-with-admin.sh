#!/bin/bash

API_URL="http://localhost:3000/api"

echo "1️⃣  登录获取token..."
CAPTCHA_RESPONSE=$(curl -s "${API_URL}/auth/captcha")
CAPTCHA_ID=$(echo $CAPTCHA_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['captchaId'])")

CAPTCHA_DEBUG=$(curl -s "${API_URL}/auth/captcha/debug")
CAPTCHA_TEXT=$(echo $CAPTCHA_DEBUG | python3 -c "import sys, json; data=json.load(sys.stdin); print([c['text'] for c in data['data'] if c['id']=='$CAPTCHA_ID'][0] if data['data'] else '')")

LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"admin\",
    \"password\": \"123456\",
    \"captchaId\": \"$CAPTCHA_ID\",
    \"captcha\": \"$CAPTCHA_TEXT\"
  }")

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('accessToken', ''))")

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ 登录失败"
  exit 1
fi

echo "✅ 登录成功"
echo ""

echo "2️⃣  创建商户（自动生成超级管理员）..."
CREATE_RESPONSE=$(curl -s -X POST "${API_URL}/merchants" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"merchantCode\": \"TEST_MERCHANT_$(date +%s)\",
    \"merchantName\": \"测试商户-自动管理员\",
    \"merchantType\": 2,
    \"contactName\": \"张三\",
    \"contactPhone\": \"13800138000\",
    \"contactEmail\": \"test@merchant.com\",
    \"description\": \"这是一个测试商户，会自动创建超级管理员\",
    \"maxProducts\": 500
  }")

echo "$CREATE_RESPONSE" | python3 -m json.tool

echo ""
echo "3️⃣  提取管理员凭证..."
echo "$CREATE_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('code') == 200:
    merchant = data.get('data', {})
    super_admin = merchant.get('superAdmin', {})
    print('✅ 商户创建成功！')
    print(f'   商户ID: {merchant.get(\"id\")}')
    print(f'   商户名称: {merchant.get(\"merchantName\")}')
    print(f'   商户编码: {merchant.get(\"merchantCode\")}')
    print('')
    print('🔑 超级管理员账号:')
    print(f'   用户名: {super_admin.get(\"username\")}')
    print(f'   密码: {super_admin.get(\"password\")}')
    print(f'   邮箱: {super_admin.get(\"email\")}')
else:
    print('❌ 创建失败')
    print(f'   错误: {data.get(\"msg\", \"未知错误\")}')
"

#!/bin/bash

# 测试 /auth/profile 接口返回商户信息
echo "============================================"
echo "测试 /auth/profile 接口"
echo "============================================"
echo ""

API_URL="http://localhost:3000/api"

# 1. 获取验证码
echo "1️⃣  获取验证码..."
CAPTCHA_RESPONSE=$(curl -s "${API_URL}/auth/captcha")
CAPTCHA_ID=$(echo $CAPTCHA_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['captchaId'])")
echo "   验证码ID: $CAPTCHA_ID"
echo ""

# 2. 获取验证码文本（从调试接口）
echo "2️⃣  获取验证码文本..."
CAPTCHA_DEBUG=$(curl -s "${API_URL}/auth/captcha/debug")
CAPTCHA_TEXT=$(echo $CAPTCHA_DEBUG | python3 -c "import sys, json; data=json.load(sys.stdin); print([c['text'] for c in data['data'] if c['id']=='$CAPTCHA_ID'][0] if data['data'] else '')")
echo "   验证码文本: $CAPTCHA_TEXT"
echo ""

# 3. 登录获取token
echo "3️⃣  登录获取token..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"admin\",
    \"password\": \"admin123\",
    \"captchaId\": \"$CAPTCHA_ID\",
    \"captcha\": \"$CAPTCHA_TEXT\"
  }")

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('accessToken', ''))")

if [ -z "$ACCESS_TOKEN" ]; then
  echo "   ❌ 登录失败"
  echo "   响应: $LOGIN_RESPONSE"
  exit 1
fi

echo "   ✅ 登录成功"
echo "   Token: ${ACCESS_TOKEN:0:50}..."
echo ""

# 4. 获取用户信息（包含商户信息）
echo "4️⃣  获取用户信息..."
PROFILE_RESPONSE=$(curl -s "${API_URL}/auth/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$PROFILE_RESPONSE" | python3 -m json.tool

echo ""
echo "============================================"
echo "检查商户信息字段:"
echo "============================================"
echo "$PROFILE_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('code') == 200:
    profile = data.get('data', {})
    print(f\"✅ merchantId: {profile.get('merchantId')}\")
    merchant = profile.get('merchant')
    if merchant:
        print(f\"✅ merchant.id: {merchant.get('id')}\")
        print(f\"✅ merchant.merchantCode: {merchant.get('merchantCode')}\")
        print(f\"✅ merchant.merchantName: {merchant.get('merchantName')}\")
        print(f\"✅ merchant.merchantType: {merchant.get('merchantType')}\")
        print(f\"✅ merchant.status: {merchant.get('status')}\")
    else:
        print(\"❌ 商户信息为空\")
else:
    print(f\"❌ 请求失败: {data.get('message')}\")
"

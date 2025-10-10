#!/bin/bash

# 商户接口完整测试脚本
echo "============================================"
echo "商户管理接口测试"
echo "============================================"
echo ""

API_URL="http://localhost:3000/api"

# 获取登录token
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

# 2. 创建商户
echo "2️⃣  创建测试商户..."
CREATE_RESPONSE=$(curl -s -X POST "${API_URL}/merchants" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantCode": "TEST_MERCHANT_'$(date +%s)'",
    "merchantName": "测试商户",
    "merchantType": 2,
    "contactName": "张三",
    "contactPhone": "13800138000",
    "contactEmail": "test@merchant.com",
    "description": "这是一个测试商户",
    "maxProducts": 500,
    "maxAdmins": 5,
    "maxStorage": 5368709120
  }')

echo "$CREATE_RESPONSE" | python3 -m json.tool
MERCHANT_ID=$(echo $CREATE_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('id', ''))")

if [ -z "$MERCHANT_ID" ]; then
  echo "❌ 创建商户失败"
  exit 1
fi

echo "✅ 商户创建成功，ID: $MERCHANT_ID"
echo ""

# 3. 查询商户列表
echo "3️⃣  查询商户列表..."
LIST_RESPONSE=$(curl -s "${API_URL}/merchants?page=1&pageSize=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$LIST_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('code') == 200:
    items = data.get('data', {}).get('items', [])
    total = data.get('data', {}).get('total', 0)
    print(f'✅ 查询成功，共 {total} 个商户')
    for item in items[:3]:
        print(f'  - {item.get(\"merchantName\")} ({item.get(\"merchantCode\")})')
else:
    print('❌ 查询失败')
"
echo ""

# 4. 查询单个商户详情
echo "4️⃣  查询商户详情 (ID: $MERCHANT_ID)..."
DETAIL_RESPONSE=$(curl -s "${API_URL}/merchants/$MERCHANT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$DETAIL_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('code') == 200:
    merchant = data.get('data', {})
    print(f'✅ 商户名称: {merchant.get(\"merchantName\")}')
    print(f'   商户编码: {merchant.get(\"merchantCode\")}')
    print(f'   商户类型: {merchant.get(\"merchantType\")}')
    print(f'   状态: {merchant.get(\"status\")}')
    print(f'   认证状态: {merchant.get(\"certificationStatus\")}')
else:
    print('❌ 查询失败')
"
echo ""

# 5. 更新商户信息
echo "5️⃣  更新商户信息..."
UPDATE_RESPONSE=$(curl -s -X PUT "${API_URL}/merchants/$MERCHANT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "merchantName": "测试商户（已更新）",
    "description": "这是一个已更新的测试商户",
    "maxProducts": 1000
  }')

echo "$UPDATE_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('code') == 200:
    merchant = data.get('data', {})
    print(f'✅ 更新成功')
    print(f'   新名称: {merchant.get(\"merchantName\")}')
    print(f'   最大商品数: {merchant.get(\"maxProducts\")}')
else:
    print('❌ 更新失败')
"
echo ""

# 6. 更新商户状态
echo "6️⃣  更新商户状态（冻结）..."
STATUS_RESPONSE=$(curl -s -X PUT "${API_URL}/merchants/$MERCHANT_ID/status" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": 2}')

echo "$STATUS_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('code') == 200:
    print('✅ 状态更新成功，已冻结')
else:
    print('❌ 状态更新失败')
"
echo ""

# 7. 更新认证状态
echo "7️⃣  更新认证状态（已认证）..."
CERT_RESPONSE=$(curl -s -X PUT "${API_URL}/merchants/$MERCHANT_ID/certification" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"certificationStatus": 2}')

echo "$CERT_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('code') == 200:
    merchant = data.get('data', {})
    print('✅ 认证状态更新成功')
    print(f'   认证状态: {merchant.get(\"certificationStatus\")}')
    print(f'   认证时间: {merchant.get(\"certificationTime\")}')
else:
    print('❌ 认证状态更新失败')
"
echo ""

# 8. 获取统计信息
echo "8️⃣  获取商户统计信息..."
STATS_RESPONSE=$(curl -s "${API_URL}/merchants/$MERCHANT_ID/statistics" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$STATS_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('code') == 200:
    stats = data.get('data', {})
    print('✅ 统计信息查询成功')
    print(f'   余额: {stats.get(\"balance\")}')
    print(f'   冻结余额: {stats.get(\"frozenBalance\")}')
    print(f'   累计销售额: {stats.get(\"totalSales\")}')
    print(f'   最大商品数: {stats.get(\"maxProducts\")}')
else:
    print('❌ 统计信息查询失败')
"
echo ""

# 9. 重新生成API密钥
echo "9️⃣  重新生成API密钥..."
KEYS_RESPONSE=$(curl -s -X POST "${API_URL}/merchants/$MERCHANT_ID/regenerate-keys" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$KEYS_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('code') == 200:
    keys = data.get('data', {})
    print('✅ API密钥重新生成成功')
    print(f'   API Key: {keys.get(\"apiKey\")[:30]}...')
    print(f'   API Secret: {keys.get(\"apiSecret\")[:30]}...')
else:
    print('❌ 密钥生成失败')
"
echo ""

# 10. 删除商户
echo "🔟  删除测试商户..."
DELETE_RESPONSE=$(curl -s -X DELETE "${API_URL}/merchants/$MERCHANT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "$DELETE_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('code') == 200:
    print('✅ 商户删除成功')
else:
    print('❌ 商户删除失败')
"
echo ""

echo "============================================"
echo "所有测试完成！"
echo "============================================"

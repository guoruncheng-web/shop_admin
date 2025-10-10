#!/bin/bash

# 验证新创建的商户、管理员、角色和权限

API_URL="http://localhost:3000/api"

# 登录获取token
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

echo "🔍 查询最新创建的商户..."
MERCHANT_LIST=$(curl -s "${API_URL}/merchants?page=1&pageSize=1" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

MERCHANT_ID=$(echo $MERCHANT_LIST | python3 -c "import sys, json; items = json.load(sys.stdin).get('data', {}).get('items', []); print(items[0]['id'] if items else '')")

echo "商户ID: $MERCHANT_ID"
echo ""

echo "📊 查询数据库验证..."
curl -s -X POST "http://localhost:3000/api/migration/query" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"sql\": \"SELECT id, username, real_name, email, merchant_id, status FROM admins WHERE merchant_id = $MERCHANT_ID\"
  }" | python3 -c "
import sys, json
data = json.load(sys.stdin)
result = data.get('data', {}).get('result', [])
if result:
    print('✅ 管理员已创建:')
    for admin in result:
        print(f'   ID: {admin.get(\"id\")}')
        print(f'   用户名: {admin.get(\"username\")}')
        print(f'   真实姓名: {admin.get(\"real_name\")}')
        print(f'   邮箱: {admin.get(\"email\")}')
        print(f'   商户ID: {admin.get(\"merchant_id\")}')
        print(f'   状态: {admin.get(\"status\")}')
else:
    print('❌ 未找到管理员')
"

echo ""

curl -s -X POST "http://localhost:3000/api/migration/query" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"sql\": \"SELECT id, name, code, merchant_id FROM roles WHERE merchant_id = $MERCHANT_ID\"
  }" | python3 -c "
import sys, json
data = json.load(sys.stdin)
result = data.get('data', {}).get('result', [])
if result:
    print('✅ 角色已创建:')
    for role in result:
        print(f'   ID: {role.get(\"id\")}')
        print(f'   名称: {role.get(\"name\")}')
        print(f'   代码: {role.get(\"code\")}')
        print(f'   商户ID: {role.get(\"merchant_id\")}')
else:
    print('❌ 未找到角色')
"

echo ""

ROLE_ID=$(curl -s -X POST "http://localhost:3000/api/migration/query" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"sql\": \"SELECT id FROM roles WHERE merchant_id = $MERCHANT_ID LIMIT 1\"
  }" | python3 -c "import sys, json; result = json.load(sys.stdin).get('data', {}).get('result', []); print(result[0]['id'] if result else '')")

if [ ! -z "$ROLE_ID" ]; then
  curl -s -X POST "http://localhost:3000/api/migration/query" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"sql\": \"SELECT COUNT(*) as count FROM role_permissions WHERE role_id = $ROLE_ID\"
    }" | python3 -c "
import sys, json
data = json.load(sys.stdin)
result = data.get('data', {}).get('result', [])
if result:
    count = result[0].get('count', 0)
    if count > 0:
        print(f'✅ 权限已分配: {count} 个权限')
    else:
        print('⚠️  未分配权限')
"
fi

echo ""

ADMIN_ID=$(curl -s -X POST "http://localhost:3000/api/migration/query" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"sql\": \"SELECT id FROM admins WHERE merchant_id = $MERCHANT_ID LIMIT 1\"
  }" | python3 -c "import sys, json; result = json.load(sys.stdin).get('data', {}).get('result', []); print(result[0]['id'] if result else '')")

if [ ! -z "$ADMIN_ID" ]; then
  curl -s -X POST "http://localhost:3000/api/migration/query" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"sql\": \"SELECT COUNT(*) as count FROM admin_roles WHERE admin_id = $ADMIN_ID\"
    }" | python3 -c "
import sys, json
data = json.load(sys.stdin)
result = data.get('data', {}).get('result', [])
if result:
    count = result[0].get('count', 0)
    if count > 0:
        print(f'✅ 管理员-角色绑定成功: {count} 个角色')
    else:
        print('❌ 管理员未绑定角色')
"
fi

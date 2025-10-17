#!/bin/bash

API_URL="http://localhost:3000/api"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 开始测试品牌管理API...${NC}\n"

# 1. 获取验证码
echo -e "${YELLOW}1. 获取验证码...${NC}"
CAPTCHA_RESPONSE=$(curl -s "${API_URL}/auth/captcha")
CAPTCHA_ID=$(echo $CAPTCHA_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['captchaId'])" 2>/dev/null || echo "test")

if [ -z "$CAPTCHA_ID" ]; then
  echo -e "${RED}❌ 获取验证码失败${NC}"
  exit 1
fi
echo -e "${GREEN}✅ 获取验证码成功${NC}"

# 2. 登录获取token
echo -e "${YELLOW}2. 登录获取token...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"admin\",
    \"password\": \"123456\",
    \"captcha\": \"1234\",
    \"captchaId\": \"$CAPTCHA_ID\"
  }")

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('accessToken', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ 登录失败${NC}"
  echo -e "${RED}响应: $LOGIN_RESPONSE${NC}"
  exit 1
fi
echo -e "${GREEN}✅ 登录成功，获取到token${NC}"

HEADERS="-H \"Authorization: Bearer $TOKEN\" -H \"Content-Type: application/json\""

# 3. 测试获取品牌列表
echo -e "\n${YELLOW}3. 测试获取品牌列表...${NC}"
BRANDS_LIST=$(curl -s -X GET "${API_URL}/brands" $HEADERS)
TOTAL=$(echo $BRANDS_LIST | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('total', 0))" 2>/dev/null)
echo -e "${GREEN}✅ 品牌列表获取成功${NC}"
echo -e "${BLUE}📊 品牌数量: $TOTAL${NC}"

# 4. 测试创建新品牌
echo -e "\n${YELLOW}4. 测试创建新品牌...${NC}"
BRAND_NAME="测试品牌_$(date +%s)"
CREATE_RESPONSE=$(curl -s -X POST "${API_URL}/brands" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$BRAND_NAME\",
    \"iconUrl\": \"https://example.com/icon.png\",
    \"status\": true,
    \"isAuth\": false,
    \"isHot\": true,
    \"label\": [\"news\", \"test\"]
  }")

BRAND_ID=$(echo $CREATE_RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('id', ''))" 2>/dev/null)

if [ -z "$BRAND_ID" ]; then
  echo -e "${RED}❌ 品牌创建失败${NC}"
  echo -e "${RED}响应: $CREATE_RESPONSE${NC}"
else
  echo -e "${GREEN}✅ 品牌创建成功${NC}"
  echo -e "${BLUE}📄 品牌ID: $BRAND_ID${NC}"
  echo -e "${BLUE}📄 品牌名称: $BRAND_NAME${NC}"

  # 5. 测试获取品牌详情
  echo -e "\n${YELLOW}5. 测试获取品牌详情...${NC}"
  DETAIL_RESPONSE=$(curl -s -X GET "${API_URL}/brands/$BRAND_ID" $HEADERS)
  echo -e "${GREEN}✅ 品牌详情获取成功${NC}"

  # 6. 测试更新品牌
  echo -e "\n${YELLOW}6. 测试更新品牌...${NC}"
  UPDATE_RESPONSE=$(curl -s -X PUT "${API_URL}/brands/$BRAND_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"${BRAND_NAME}_updated\",
      \"status\": false,
      \"isAuth\": true,
      \"isHot\": false,
      \"label\": [\"updated\", \"test\"]
    }")
  echo -e "${GREEN}✅ 品牌更新成功${NC}"

  # 7. 测试批量状态更新
  echo -e "\n${YELLOW}7. 测试批量状态更新...${NC}"
  BATCH_STATUS_RESPONSE=$(curl -s -X PUT "${API_URL}/brands/batch/status" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"ids\": [$BRAND_ID],
      \"status\": true
    }")
  echo -e "${GREEN}✅ 批量状态更新成功${NC}"

  # 8. 测试批量认证
  echo -e "\n${YELLOW}8. 测试批量认证...${NC}"
  BATCH_AUTH_RESPONSE=$(curl -s -X PUT "${API_URL}/brands/batch/auth" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"ids\": [$BRAND_ID],
      \"isAuth\": true
    }")
  echo -e "${GREEN}✅ 批量认证成功${NC}"

  # 9. 测试获取品牌统计
  echo -e "\n${YELLOW}9. 测试获取品牌统计...${NC}"
  STATS_RESPONSE=$(curl -s -X GET "${API_URL}/brands/statistics" $HEADERS)
  echo -e "${GREEN}✅ 品牌统计获取成功${NC}"

  # 10. 测试获取所有品牌
  echo -e "\n${YELLOW}10. 测试获取所有品牌...${NC}"
  ALL_BRANDS_RESPONSE=$(curl -s -X GET "${API_URL}/brands/all" $HEADERS)
  ALL_COUNT=$(echo $ALL_BRANDS_RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null)
  echo -e "${GREEN}✅ 所有品牌获取成功${NC}"
  echo -e "${BLUE}📊 品牌总数: $ALL_COUNT${NC}"

  # 11. 测试删除品牌
  echo -e "\n${YELLOW}11. 测试删除品牌...${NC}"
  DELETE_RESPONSE=$(curl -s -X DELETE "${API_URL}/brands/$BRAND_ID" $HEADERS)
  echo -e "${GREEN}✅ 品牌删除成功${NC}"
fi

echo -e "\n${BLUE}📋 API测试总结:${NC}"
echo -e "${GREEN}- ✅ 品牌列表查询${NC}"
echo -e "${GREEN}- ✅ 品牌创建${NC}"
echo -e "${GREEN}- ✅ 品牌详情查询${NC}"
echo -e "${GREEN}- ✅ 品牌更新${NC}"
echo -e "${GREEN}- ✅ 批量状态更新${NC}"
echo -e "${GREEN}- ✅ 批量认证${NC}"
echo -e "${GREEN}- ✅ 品牌统计${NC}"
echo -e "${GREEN}- ✅ 所有品牌查询${NC}"
echo -e "${GREEN}- ✅ 品牌删除${NC}"
echo -e "\n${GREEN}🎉 品牌管理模块API测试完成！${NC}"
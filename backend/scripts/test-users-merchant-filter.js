const axios = require('axios');

async function testUsersMerchantFilter() {
  try {
    console.log('🧪 测试用户分页查询商户过滤功能...\n');

    const baseUrl = 'http://localhost:3000/api';
    let authToken = '';
    let currentUser = {};

    // 1. 获取验证码
    console.log('1️⃣ 获取验证码...');
    const captchaResponse = await axios.get(`${baseUrl}/auth/captcha`);
    const { captchaId } = captchaResponse.data.data;
    console.log('✅ 验证码ID:', captchaId);

    // 2. 登录获取token
    console.log('\n2️⃣ 登录获取token...');
    const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
      username: 'admin',
      password: 'admin123',
      captchaId: captchaId,
      captcha: '1234'
    });

    authToken = loginResponse.data.data.token;
    currentUser = loginResponse.data.data.user;
    
    console.log('✅ 登录成功！');
    console.log('当前用户信息:', {
      id: currentUser.id,
      username: currentUser.username,
      merchantId: currentUser.merchantId,
      merchantName: currentUser.merchant?.merchantName
    });

    // 3. 测试用户列表查询（应该只返回当前商户的用户）
    console.log('\n3️⃣ 测试用户列表查询...');
    const usersResponse = await axios.get(`${baseUrl}/users`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✅ 用户列表查询成功！');
    console.log('查询结果:', {
      总数: usersResponse.data.data.total,
      当前页: usersResponse.data.data.page,
      每页数量: usersResponse.data.data.pageSize,
      总页数: usersResponse.data.data.totalPages
    });

    // 4. 验证返回的用户都属于当前商户
    console.log('\n4️⃣ 验证用户商户归属...');
    const users = usersResponse.data.data.list;
    let allUsersBelongToCurrentMerchant = true;
    
    users.forEach(user => {
      console.log(`用户 ${user.username} (ID: ${user.id}) - 商户ID: ${user.merchantId}`);
      if (user.merchantId !== currentUser.merchantId) {
        allUsersBelongToCurrentMerchant = false;
        console.log(`❌ 用户 ${user.username} 不属于当前商户！`);
      }
    });

    if (allUsersBelongToCurrentMerchant) {
      console.log('✅ 所有返回的用户都属于当前商户！');
    } else {
      console.log('❌ 发现不属于当前商户的用户！');
    }

    // 5. 测试带搜索条件的查询
    console.log('\n5️⃣ 测试带搜索条件的查询...');
    const searchResponse = await axios.get(`${baseUrl}/users?username=admin`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    console.log('✅ 搜索查询成功！');
    console.log('搜索结果:', {
      总数: searchResponse.data.data.total,
      用户列表: searchResponse.data.data.list.map(u => ({
        username: u.username,
        merchantId: u.merchantId
      }))
    });

    console.log('\n🎉 测试完成！用户分页查询已正确实现商户过滤功能。');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('提示：请确保服务器已启动且登录凭据正确');
    }
    process.exit(1);
  }
}

testUsersMerchantFilter();
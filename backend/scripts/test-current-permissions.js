const axios = require('axios');

async function testCurrentPermissions() {
  try {
    console.log('🧪 测试当前权限获取逻辑...\n');

    const baseUrl = 'http://localhost:3000/api';

    // 1. 登录获取 token
    console.log('1️⃣ 登录...');
    const captchaResponse = await axios.get(`${baseUrl}/auth/captcha`);
    const { captchaId } = captchaResponse.data.data;

    const loginResponse = await axios.post(`${baseUrl}/auth/login`, {
      username: 'admin',
      password: 'admin123',
      captchaId: captchaId,
      captcha: '1234'
    });

    const token = loginResponse.data.data.accessToken;
    console.log('✅ 登录成功\n');

    // 2. 获取用户信息
    console.log('2️⃣ 获取用户权限...');
    const profileResponse = await axios.get(`${baseUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { permissions } = profileResponse.data.data;
    console.log(`✅ 用户权限数量: ${permissions.length}`);
    console.log('权限列表:', permissions);

    // 3. 检查是否有 system:login-log:view 权限
    console.log('\n3️⃣ 检查 system:login-log:view 权限:');
    const hasPermission = permissions.includes('system:login-log:view');

    if (hasPermission) {
      console.log('✅ 用户有 system:login-log:view 权限');
    } else {
      console.log('❌ 用户没有 system:login-log:view 权限');
      console.log('\n原因分析:');
      console.log('- 当前代码从 permissions 表读取权限');
      console.log('- 但应该从菜单的 button_key 字段读取');
      console.log('- 登录日志菜单的 button_key 为 null');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testCurrentPermissions();

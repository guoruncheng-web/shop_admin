const axios = require('axios');

async function testMenuPermissions() {
  try {
    console.log('🧪 测试菜单管理权限...\n');

    const baseUrl = 'http://localhost:3000/api';

    // 1. 登录
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

    // 2. 获取用户权限
    console.log('2️⃣ 获取用户权限...');
    const profileResponse = await axios.get(`${baseUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { permissions } = profileResponse.data.data;
    console.log(`✅ 用户权限数量: ${permissions.length}\n`);

    // 3. 检查菜单管理权限
    console.log('3️⃣ 检查菜单管理权限:\n');
    const menuPermissions = [
      'system:menu:view',
      'system:menu:add',
      'system:menu:edit',
      'system:menu:delete'
    ];

    menuPermissions.forEach(perm => {
      const has = permissions.includes(perm);
      console.log(`${has ? '✅' : '❌'} ${perm}`);
    });

    // 4. 测试菜单管理接口
    console.log('\n4️⃣ 测试菜单管理接口访问:\n');

    try {
      const menusResponse = await axios.get(`${baseUrl}/menus`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ GET /menus - 成功访问 (返回 ${menusResponse.data.data.length} 条数据)`);
    } catch (error) {
      console.log(`❌ GET /menus - 访问失败: ${error.response?.data?.message || error.message}`);
    }

    // 5. 显示所有权限
    console.log('\n5️⃣ 所有权限列表:\n');
    console.log(permissions.sort().join('\n'));

    console.log('\n🎉 测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testMenuPermissions();

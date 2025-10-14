const axios = require('axios');

async function testProfileMenus() {
  try {
    console.log('🧪 测试 /auth/profile 接口...\n');

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

    // 2. 获取用户信息
    console.log('2️⃣ 获取用户信息...');
    const profileResponse = await axios.get(`${baseUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { menus } = profileResponse.data.data;
    console.log(`✅ 获取成功，共 ${menus.length} 个顶级菜单\n`);

    // 3. 检查菜单管理
    console.log('3️⃣ 检查菜单管理:\n');

    function findMenus(menuList, name, results = []) {
      menuList.forEach(menu => {
        if (menu.name === name) {
          results.push(menu);
        }
        if (menu.children && menu.children.length > 0) {
          findMenus(menu.children, name, results);
        }
      });
      return results;
    }

    const menuManageMenus = findMenus(menus, '菜单管理');

    console.log(`找到 ${menuManageMenus.length} 个"菜单管理"菜单\n`);

    if (menuManageMenus.length === 1) {
      console.log('✅ 菜单管理唯一');
      console.log('菜单信息:', {
        name: menuManageMenus[0].name,
        path: menuManageMenus[0].path,
        meta: menuManageMenus[0].meta
      });
    } else if (menuManageMenus.length > 1) {
      console.log('⚠️  仍然有重复的菜单管理');
      console.table(menuManageMenus.map(m => ({
        name: m.name,
        path: m.path,
        component: m.component
      })));
    } else {
      console.log('❌ 没有找到菜单管理');
    }

    // 4. 显示所有菜单
    console.log('\n4️⃣ 所有菜单结构:\n');
    function printMenuTree(menuList, indent = 0) {
      menuList.forEach(menu => {
        console.log('  '.repeat(indent) + `- ${menu.name} (${menu.path || 'no-path'})`);
        if (menu.children && menu.children.length > 0) {
          printMenuTree(menu.children, indent + 1);
        }
      });
    }
    printMenuTree(menus);

    console.log('\n🎉 测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testProfileMenus();

const axios = require('axios');

async function testMenusTreeApi() {
  try {
    console.log('🧪 测试 /menus/tree 接口...\n');

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

    // 2. 获取菜单树
    console.log('2️⃣ 获取菜单树...');
    const treeResponse = await axios.get(`${baseUrl}/menus/tree`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const menus = treeResponse.data.data;
    console.log(`✅ 获取成功，共 ${menus.length} 个顶级菜单\n`);

    // 3. 查找菜单管理及其按钮
    console.log('3️⃣ 查找菜单管理及其按钮:\n');

    function findMenu(menuList, name) {
      for (const menu of menuList) {
        if (menu.name === name) {
          return menu;
        }
        if (menu.children && menu.children.length > 0) {
          const found = findMenu(menu.children, name);
          if (found) return found;
        }
      }
      return null;
    }

    const menuManage = findMenu(menus, '菜单管理');

    if (menuManage) {
      console.log(`找到"菜单管理" (ID: ${menuManage.id})`);
      console.log(`子菜单/按钮数量: ${menuManage.children?.length || 0}\n`);

      if (menuManage.children && menuManage.children.length > 0) {
        console.log('按钮列表:');
        console.table(menuManage.children.map(child => ({
          ID: child.id,
          名称: child.name,
          button_key: child.buttonKey || '-',
          类型: child.type === 3 ? '按钮' : child.type === 2 ? '菜单' : '目录'
        })));

        // 检查是否有重复
        const buttonNames = menuManage.children.map(c => c.name);
        const uniqueNames = new Set(buttonNames);
        if (buttonNames.length !== uniqueNames.size) {
          console.log('\n⚠️  发现重复的按钮！');
        }
      }
    } else {
      console.log('❌ 未找到"菜单管理"');
    }

    console.log('\n🎉 测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testMenusTreeApi();

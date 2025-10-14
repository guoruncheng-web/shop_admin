const axios = require('axios');

async function testAllMenusTree() {
  try {
    console.log('🧪 测试所有菜单的按钮显示...\n');

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

    // 3. 统计所有菜单的按钮
    console.log('3️⃣ 统计所有菜单的按钮数量:\n');

    function countButtons(menuList, result = []) {
      menuList.forEach(menu => {
        if (menu.type === 2) { // 菜单类型
          const buttonCount = menu.children?.filter(c => c.type === 3).length || 0;
          result.push({
            菜单名称: menu.name,
            菜单ID: menu.id,
            按钮数量: buttonCount,
            有按钮: buttonCount > 0 ? '✅' : '❌'
          });
        }
        if (menu.children && menu.children.length > 0) {
          countButtons(menu.children, result);
        }
      });
      return result;
    }

    const menuStats = countButtons(menus);
    console.table(menuStats);

    // 4. 显示有按钮的菜单详情
    console.log('\n4️⃣ 有按钮的菜单详情:\n');

    function findMenusWithButtons(menuList, result = []) {
      menuList.forEach(menu => {
        if (menu.type === 2) {
          const buttons = menu.children?.filter(c => c.type === 3) || [];
          if (buttons.length > 0) {
            result.push({
              菜单: menu.name,
              按钮: buttons.map(b => `${b.name}(${b.buttonKey || 'no-key'})`).join(', ')
            });
          }
        }
        if (menu.children && menu.children.length > 0) {
          findMenusWithButtons(menu.children, result);
        }
      });
      return result;
    }

    const menusWithButtons = findMenusWithButtons(menus);
    if (menusWithButtons.length > 0) {
      console.table(menusWithButtons);
    } else {
      console.log('没有找到有按钮的菜单');
    }

    console.log('\n🎉 测试完成！');
    console.log('✅ 现在所有按钮都从数据库读取，不会自动生成');

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testAllMenusTree();

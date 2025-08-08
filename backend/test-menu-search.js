const axios = require('axios');

async function testMenuSearch() {
  try {
    // 测试不带查询参数的菜单列表
    console.log('测试1: 获取所有菜单');
    const allMenus = await axios.get('http://localhost:3000/api/v1/menus', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJzdXBlcl9hZG1pbiJdLCJwZXJtaXNzaW9ucyI6WyJzeXN0ZW06YWRtaW4iLCJzeXN0ZW06dXNlciIsInN5c3RlbTpyb2xlIiwic3lzdGVtOnBlcm1pc3Npb24iLCJwcm9kdWN0Omxpc3QiLCJwcm9kdWN0OmNyZWF0ZSIsInByb2R1Y3Q6dXBkYXRlIiwicHJvZHVjdDpkZWxldGUiLCJvcmRlcjpsaXN0Iiwib3JkZXI6dXBkYXRlIiwib3JkZXI6ZGVsZXRlIiwiYmFubmVyOmxpc3QiLCJiYW5uZXI6Y3JlYXRlIiwiYmFubmVyOnVwZGF0ZSIsImJhbm5lcjpkZWxldGUiXSwiaWF0IjoxNzU0NjM3NDIyLCJleHAiOjE3NTUyNDIyMjIsImF1ZCI6IndlY2hhdC1tYWxsLWNsaWVudCIsImlzcyI6IndlY2hhdC1tYWxsLWFwaSJ9.rzfZwWzxGu92ZZCjJttiQrufHEYIOtN8ytdOEwJm3hg'
      }
    });
    console.log('所有菜单数量:', allMenus.data.data.length);
    console.log('前3个菜单名称:', allMenus.data.data.slice(0, 3).map(m => m.name));

    // 测试模糊查询 - 搜索包含"管理"的菜单
    console.log('\n测试2: 搜索包含"管理"的菜单');
    const managementMenus = await axios.get('http://localhost:3000/api/v1/menus?name=管理', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJzdXBlcl9hZG1pbiJdLCJwZXJtaXNzaW9ucyI6WyJzeXN0ZW06YWRtaW4iLCJzeXN0ZW06dXNlciIsInN5c3RlbTpyb2xlIiwic3lzdGVtOnBlcm1pc3Npb24iLCJwcm9kdWN0Omxpc3QiLCJwcm9kdWN0OmNyZWF0ZSIsInByb2R1Y3Q6dXBkYXRlIiwicHJvZHVjdDpkZWxldGUiLCJvcmRlcjpsaXN0Iiwib3JkZXI6dXBkYXRlIiwib3JkZXI6ZGVsZXRlIiwiYmFubmVyOmxpc3QiLCJiYW5uZXI6Y3JlYXRlIiwiYmFubmVyOnVwZGF0ZSIsImJhbm5lcjpkZWxldGUiXSwiaWF0IjoxNzU0NjM3NDIyLCJleHAiOjE3NTUyNDIyMjIsImF1ZCI6IndlY2hhdC1tYWxsLWNsaWVudCIsImlzcyI6IndlY2hhdC1tYWxsLWFwaSJ9.rzfZwWzxGu92ZZCjJttiQrufHEYIOtN8ytdOEwJm3hg'
      }
    });
    console.log('包含"管理"的菜单数量:', managementMenus.data.data.length);
    console.log('包含"管理"的菜单名称:', managementMenus.data.data.map(m => m.name));

    // 测试模糊查询 - 搜索包含"用户"的菜单
    console.log('\n测试3: 搜索包含"用户"的菜单');
    const userMenus = await axios.get('http://localhost:3000/api/v1/menus?name=用户', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlcyI6WyJzdXBlcl9hZG1pbiJdLCJwZXJtaXNzaW9ucyI6WyJzeXN0ZW06YWRtaW4iLCJzeXN0ZW06dXNlciIsInN5c3RlbTpyb2xlIiwic3lzdGVtOnBlcm1pc3Npb24iLCJwcm9kdWN0Omxpc3QiLCJwcm9kdWN0OmNyZWF0ZSIsInByb2R1Y3Q6dXBkYXRlIiwicHJvZHVjdDpkZWxldGUiLCJvcmRlcjpsaXN0Iiwib3JkZXI6dXBkYXRlIiwib3JkZXI6ZGVsZXRlIiwiYmFubmVyOmxpc3QiLCJiYW5uZXI6Y3JlYXRlIiwiYmFubmVyOnVwZGF0ZSIsImJhbm5lcjpkZWxldGUiXSwiaWF0IjoxNzU0NjM3NDIyLCJleHAiOjE3NTUyNDIyMjIsImF1ZCI6IndlY2hhdC1tYWxsLWNsaWVudCIsImlzcyI6IndlY2hhdC1tYWxsLWFwaSJ9.rzfZwWzxGu92ZZCjJttiQrufHEYIOtN8ytdOEwJm3hg'
      }
    });
    console.log('包含"用户"的菜单数量:', userMenus.data.data.length);
    console.log('包含"用户"的菜单名称:', userMenus.data.data.map(m => m.name));

  } catch (error) {
    console.error('测试失败:', error.response?.data || error.message);
  }
}

testMenuSearch();

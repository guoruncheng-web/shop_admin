const https = require('https');
const http = require('http');
const { URL } = require('url');

function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (options.data) {
      requestOptions.headers['Content-Type'] = 'application/json';
      const dataString = JSON.stringify(options.data);
      requestOptions.headers['Content-Length'] = Buffer.byteLength(dataString);
    }

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.data) {
      req.write(JSON.stringify(options.data));
    }

    req.end();
  });
}

const BASE_URL = 'http://localhost:5777/api';

async function testUserTracking() {
  try {
    console.log('1. 开始登录获取认证令牌...');
    // 首先获取验证码
    const captchaResponse = await httpRequest(`${BASE_URL}/auth/captcha`);
    console.log('获取验证码成功');

    // 登录获取令牌
    const loginResponse = await httpRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      data: {
        username: 'admin',
        password: '123456',
        captcha: '1234', // 一般开发环境可能允许固定验证码
        captchaId: captchaResponse.data.data?.id || 'test'
      }
    });

    if (loginResponse.status !== 200 && loginResponse.status !== 201) {
      console.log('登录失败:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.data?.accessToken;
    if (!token) {
      console.log('未获取到令牌:', loginResponse.data);
      return;
    }
    console.log('登录成功，获取到令牌');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('\n2. 测试菜单树接口是否包含用户跟踪字段...');
    // 测试菜单树接口
    const treeResponse = await httpRequest(`${BASE_URL}/menus/tree`, { headers });
    console.log('菜单树接口调用成功');
    
    // 检查返回的数据是否包含用户跟踪字段
    const menus = treeResponse.data.data || treeResponse.data;
    if (menus && menus.length > 0) {
      const firstMenu = menus[0];
      console.log('第一个菜单的用户跟踪字段:');
      console.log('- 创建者ID:', firstMenu.createdBy);
      console.log('- 创建者姓名:', firstMenu.createdByName);
      console.log('- 更新者ID:', firstMenu.updatedBy);
      console.log('- 更新者姓名:', firstMenu.updatedByName);
      console.log('- 创建时间:', firstMenu.createdAt);
      console.log('- 更新时间:', firstMenu.updatedAt);
    } else {
      console.log('暂无菜单数据');
    }

    console.log('\n3. 测试新增菜单时是否自动填入用户信息...');
    // 测试新增菜单
    const newMenuData = {
      name: '测试菜单_' + Date.now(),
      title: '测试菜单',
      path: '/test-menu',
      component: 'TestComponent',
      type: 2, // 菜单类型
      status: true,
      orderNum: 999,
      parentId: null
    };

    const createResponse = await httpRequest(`${BASE_URL}/menus`, {
      method: 'POST',
      headers,
      data: newMenuData
    });
    
    if (createResponse.status !== 200 && createResponse.status !== 201) {
      console.log('新增菜单失败:', createResponse.data);
      return;
    }
    
    const createdMenu = createResponse.data.data;
    console.log('新增菜单成功');
    console.log('新菜单的用户跟踪字段:');
    console.log('- 创建者ID:', createdMenu.createdBy);
    console.log('- 创建者姓名:', createdMenu.createdByName);
    console.log('- 更新者ID:', createdMenu.updatedBy);
    console.log('- 更新者姓名:', createdMenu.updatedByName);

    console.log('\n4. 测试修改菜单时是否更新更新者信息...');
    // 测试修改菜单
    const updateData = {
      name: createdMenu.name + '_updated',
      title: createdMenu.title + '_updated'
    };

    const updateResponse = await httpRequest(`${BASE_URL}/menus/${createdMenu.id}`, {
      method: 'PUT',
      headers,
      data: updateData
    });
    
    if (updateResponse.status !== 200) {
      console.log('修改菜单失败:', updateResponse.data);
    } else {
      const updatedMenu = updateResponse.data.data;
      console.log('修改菜单成功');
      console.log('修改后的用户跟踪字段:');
      console.log('- 创建者ID:', updatedMenu.createdBy, '(应该保持不变)');
      console.log('- 创建者姓名:', updatedMenu.createdByName, '(应该保持不变)');
      console.log('- 更新者ID:', updatedMenu.updatedBy, '(应该是当前用户)');
      console.log('- 更新者姓名:', updatedMenu.updatedByName, '(应该是当前用户)');
    }

    console.log('\n5. 清理测试数据...');
    // 删除测试菜单
    const deleteResponse = await httpRequest(`${BASE_URL}/menus/${createdMenu.id}`, {
      method: 'DELETE',
      headers
    });
    
    if (deleteResponse.status === 200) {
      console.log('测试菜单已删除');
    }

    console.log('\n✅ 用户跟踪功能测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testUserTracking();
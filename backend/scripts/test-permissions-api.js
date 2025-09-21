const axios = require('axios');

const BASE_URL = 'http://localhost:5777/api';

// 测试用的认证token（需要先登录获取）
let authToken = '';

async function testPermissionsAPI() {
  console.log('🧪 开始测试权限管理 API...\n');

  try {
    // 1. 测试获取权限树
    console.log('1️⃣ 测试获取权限树...');
    const treeResponse = await axios.get(`${BASE_URL}/permissions/tree`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    });
    
    if (treeResponse.data.code === 200) {
      console.log('✅ 权限树获取成功');
      console.log(`📊 权限树节点数量: ${treeResponse.data.data.length}`);
      
      // 显示第一个节点的结构
      if (treeResponse.data.data.length > 0) {
        const firstNode = treeResponse.data.data[0];
        console.log(`📁 第一个节点: ${firstNode.name} (${firstNode.code})`);
        if (firstNode.children && firstNode.children.length > 0) {
          console.log(`   └─ 子节点数量: ${firstNode.children.length}`);
        }
      }
    } else {
      console.log('❌ 权限树获取失败:', treeResponse.data.msg);
    }

    // 2. 测试获取角色权限（假设角色ID为1）
    console.log('\n2️⃣ 测试获取角色权限...');
    const rolePermissionsResponse = await axios.get(`${BASE_URL}/roles/1/permissions`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    });
    
    if (rolePermissionsResponse.data.code === 200) {
      console.log('✅ 角色权限获取成功');
      console.log(`📊 角色权限数量: ${rolePermissionsResponse.data.data.length}`);
    } else {
      console.log('❌ 角色权限获取失败:', rolePermissionsResponse.data.msg);
    }

    // 3. 测试分配角色权限
    console.log('\n3️⃣ 测试分配角色权限...');
    const assignResponse = await axios.post(`${BASE_URL}/roles/1/permissions`, {
      permissionIds: [1, 11, 111, 112, 113]
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      }
    });
    
    if (assignResponse.data.code === 200) {
      console.log('✅ 角色权限分配成功');
    } else {
      console.log('❌ 角色权限分配失败:', assignResponse.data.msg);
    }

    console.log('\n🎉 API 测试完成！');

  } catch (error) {
    if (error.response) {
      console.log(`❌ API 请求失败 (${error.response.status}):`, error.response.data);
      
      if (error.response.status === 401) {
        console.log('💡 提示: 需要先登录获取认证token');
        console.log('   可以通过 POST /api/auth/login 获取token');
      } else if (error.response.status === 404) {
        console.log('💡 提示: 接口不存在，请确保后端服务已启动并包含权限模块');
      }
    } else {
      console.log('❌ 网络错误:', error.message);
      console.log('💡 提示: 请确保后端服务运行在 http://localhost:5777');
    }
  }
}

// 如果提供了token参数，使用它
if (process.argv[2]) {
  authToken = process.argv[2];
  console.log('🔑 使用提供的认证token');
}

// 运行测试
testPermissionsAPI().catch(console.error);
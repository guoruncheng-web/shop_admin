import axios, { AxiosInstance, AxiosResponse } from 'axios';

// 配置
const BASE_URL = 'http://localhost:3000';
let authToken = '';

// 测试用户凭据
const TEST_USER = {
  username: 'admin',
  password: '123456'
};

// 测试权限
const TEST_PERMISSIONS = [
  'system:menu:create',
  'system:menu:view',
  'system:menu:update',
  'system:menu:delete'
];

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message: string, color: keyof typeof colors = 'reset'): void {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 登录获取token
async function login(): Promise<any> {
  try {
    log('🔐 正在登录...', 'blue');
    
    // 首先获取验证码
    const captchaResponse: AxiosResponse = await axios.get(`${BASE_URL}/auth/captcha`);
    const { captchaId } = captchaResponse.data.data;
    
    // 登录
    const loginResponse: AxiosResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: TEST_USER.username,
      password: TEST_USER.password,
      captchaId,
      captcha: 'test' // 开发模式下验证码验证会被跳过
    });
    
    authToken = loginResponse.data.data.accessToken;
    log('✅ 登录成功', 'green');
    
    // 获取用户信息
    const profileResponse: AxiosResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const userProfile = profileResponse.data.data;
    log('📋 用户信息:', 'blue');
    log(`   用户名: ${userProfile.username}`, 'blue');
    log(`   角色: ${userProfile.roles.join(', ')}`, 'blue');
    log(`   权限数量: ${userProfile.permissions.length}`, 'blue');
    
    return userProfile;
  } catch (error: any) {
    log(`❌ 登录失败: ${error.message}`, 'red');
    if (error.response) {
      log(`   响应数据: ${JSON.stringify(error.response.data)}`, 'red');
    }
    throw error;
  }
}

// 测试菜单权限
async function testMenuPermissions(): Promise<void> {
  try {
    log('\n🧪 开始测试菜单权限...', 'blue');
    
    const headers = { Authorization: `Bearer ${authToken}` };
    
    // 测试获取菜单列表（需要查看权限）
    log('\n📋 测试获取菜单列表...', 'yellow');
    try {
      const response: AxiosResponse = await axios.get(`${BASE_URL}/menus`, { headers });
      log(`✅ 获取菜单列表成功，返回 ${response.data.data.length} 条记录`, 'green');
    } catch (error: any) {
      if (error.response?.status === 403) {
        log('❌ 权限验证生效：没有查看菜单的权限', 'yellow');
      } else {
        log(`❌ 获取菜单列表失败: ${error.message}`, 'red');
      }
    }
    
    // 测试创建菜单（需要创建权限）
    log('\n➕ 测试创建菜单...', 'yellow');
    try {
      const newMenu = {
        name: '测试菜单',
        title: '测试菜单',
        path: '/test',
        component: 'test/index',
        type: 2, // 菜单类型
        status: true
      };
      
      const response: AxiosResponse = await axios.post(`${BASE_URL}/menus`, newMenu, { headers });
      log(`✅ 创建菜单成功，菜单ID: ${response.data.data.id}`, 'green');
      
      // 测试更新菜单（需要更新权限）
      const menuId = response.data.data.id;
      log('\n✏️ 测试更新菜单...', 'yellow');
      try {
        const updateData = { title: '测试菜单-已更新' };
        await axios.patch(`${BASE_URL}/menus/${menuId}`, updateData, { headers });
        log('✅ 更新菜单成功', 'green');
      } catch (error: any) {
        if (error.response?.status === 403) {
          log('❌ 权限验证生效：没有更新菜单的权限', 'yellow');
        } else {
          log(`❌ 更新菜单失败: ${error.message}`, 'red');
        }
      }
      
      // 测试删除菜单（需要删除权限）
      log('\n🗑️ 测试删除菜单...', 'yellow');
      try {
        await axios.delete(`${BASE_URL}/menus/${menuId}`, { headers });
        log('✅ 删除菜单成功', 'green');
      } catch (error: any) {
        if (error.response?.status === 403) {
          log('❌ 权限验证生效：没有删除菜单的权限', 'yellow');
        } else {
          log(`❌ 删除菜单失败: ${error.message}`, 'red');
        }
      }
      
    } catch (error: any) {
      if (error.response?.status === 403) {
        log('❌ 权限验证生效：没有创建菜单的权限', 'yellow');
      } else {
        log(`❌ 创建菜单失败: ${error.message}`, 'red');
      }
    }
    
  } catch (error: any) {
    log(`❌ 菜单权限测试失败: ${error.message}`, 'red');
  }
}

// 测试操作日志
async function testOperationLogs(): Promise<void> {
  try {
    log('\n📝 测试操作日志功能...', 'blue');
    
    const headers = { Authorization: `Bearer ${authToken}` };
    
    // 获取操作日志列表
    log('\n📋 获取操作日志列表...', 'yellow');
    try {
      const response: AxiosResponse = await axios.get(`${BASE_URL}/operation-logs`, { headers });
      log(`✅ 获取操作日志成功，返回 ${response.data.data.length} 条记录`, 'green');
      
      // 显示最近几条日志
      const recentLogs = response.data.data.slice(0, 3);
      recentLogs.forEach((log: any, index: number) => {
        log(`   ${index + 1}. ${log.description} - ${log.status} - ${new Date(log.createdAt).toLocaleString()}`, 'blue');
      });
    } catch (error: any) {
      log(`❌ 获取操作日志失败: ${error.message}`, 'red');
    }
    
  } catch (error: any) {
    log(`❌ 操作日志测试失败: ${error.message}`, 'red');
  }
}

// 测试无权限访问
async function testUnauthorizedAccess(): Promise<void> {
  try {
    log('\n🚫 测试无权限访问...', 'blue');
    
    // 不带token访问
    log('\n🔓 测试未授权访问...', 'yellow');
    try {
      await axios.get(`${BASE_URL}/menus`);
      log('❌ 未授权访问应该被拦截', 'red');
    } catch (error: any) {
      if (error.response?.status === 401) {
        log('✅ 未授权访问被正确拦截', 'green');
      } else {
        log(`❌ 未预期的错误: ${error.message}`, 'red');
      }
    }
    
    // 带无效token访问
    log('\n🔑 测试无效token访问...', 'yellow');
    try {
      await axios.get(`${BASE_URL}/menus`, {
        headers: { Authorization: 'Bearer invalid_token' }
      });
      log('❌ 无效token应该被拦截', 'red');
    } catch (error: any) {
      if (error.response?.status === 401) {
        log('✅ 无效token被正确拦截', 'green');
      } else {
        log(`❌ 未预期的错误: ${error.message}`, 'red');
      }
    }
    
  } catch (error: any) {
    log(`❌ 无权限访问测试失败: ${error.message}`, 'red');
  }
}

// 主测试函数
async function runTests(): Promise<void> {
  log('🚀 开始权限模块测试', 'blue');
  log('=====================================', 'blue');
  
  try {
    // 登录
    const userProfile = await login();
    
    // 测试菜单权限
    await testMenuPermissions();
    
    // 测试操作日志
    await testOperationLogs();
    
    // 测试无权限访问
    await testUnauthorizedAccess();
    
    log('\n=====================================', 'green');
    log('✅ 权限模块测试完成', 'green');
    
  } catch (error: any) {
    log('\n=====================================', 'red');
    log('❌ 权限模块测试失败', 'red');
    log(`错误: ${error.message}`, 'red');
  }
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error);
}

export {
  runTests,
  login,
  testMenuPermissions,
  testOperationLogs,
  testUnauthorizedAccess
};
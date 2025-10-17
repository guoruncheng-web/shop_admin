#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 品牌管理模块测试运行器\n');

// 检查后端服务是否运行
function checkServerStatus() {
  try {
    execSync('curl -s http://localhost:3000/api/auth/captcha', { stdio: 'ignore', timeout: 5000 });
    return true;
  } catch (error) {
    return false;
  }
}

// 运行数据库迁移
function runMigration() {
  try {
    console.log('📦 运行数据库迁移...');
    execSync('npm run migration:run', { stdio: 'inherit' });
    console.log('✅ 数据库迁移完成\n');
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error.message);
    process.exit(1);
  }
}

// 运行API测试
function runApiTests() {
  const testScript = path.join(__dirname, 'test-brands-api.sh');
  
  if (!fs.existsSync(testScript)) {
    console.error('❌ 测试脚本不存在:', testScript);
    return;
  }

  try {
    console.log('🧪 运行API测试...\n');
    execSync(`chmod +x "${testScript}"`, { stdio: 'ignore' });
    execSync(`"${testScript}"`, { stdio: 'inherit', cwd: __dirname });
    console.log('\n✅ API测试完成');
  } catch (error) {
    console.error('\n❌ API测试失败:', error.message);
    process.exit(1);
  }
}

// 主函数
async function main() {
  console.log('检查后端服务状态...');
  
  if (!checkServerStatus()) {
    console.error('❌ 后端服务未运行，请先启动后端服务');
    console.log('💡 启动命令: npm run start:dev');
    process.exit(1);
  }

  console.log('✅ 后端服务运行正常\n');

  // 运行迁移
  runMigration();

  // 运行API测试
  runApiTests();

  console.log('\n🎉 所有测试完成！');
  console.log('\n📋 测试结果说明:');
  console.log('- 如果所有测试显示 ✅，说明品牌管理模块功能正常');
  console.log('- 如果有 ❌，请检查对应的错误信息并修复');
  console.log('- 可以查看后端日志获取更多详细信息');
}

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('❌ 未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ 未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 运行主函数
main();
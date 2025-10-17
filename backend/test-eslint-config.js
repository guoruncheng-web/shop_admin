#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 测试ESLint配置...\n');

// 测试文件列表
const testFiles = [
  'src/modules/brands/entities/brand.entity.ts',
  'src/modules/brands/controllers/brands.controller.ts',
  'src/modules/brands/services/brands.service.ts',
  'scripts/safe-fix-brands-table.js',
  'check-brands-table.js',
];

console.log('📋 测试文件列表:');
testFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n🔧 运行ESLint检查...\n');

testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      console.log(`检查文件: ${file}`);
      const result = execSync(`npx eslint "${file}" --format=json`, {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const eslintOutput = JSON.parse(result);
      if (eslintOutput.length === 0) {
        console.log('  ✅ 无ESLint错误');
      } else {
        console.log('  ❌ 发现ESLint错误:');
        eslintOutput.forEach(error => {
          console.log(`     ${error.severity}: ${error.message} (${error.ruleId})`);
          console.log(`     位置: 第${error.line}行，第${error.column}列`);
        });
      }
    } catch (error) {
      if (error.status === 1) {
        // ESLint发现了错误
        try {
          const eslintOutput = JSON.parse(error.stdout);
          console.log('  ❌ 发现ESLint错误:');
          eslintOutput.forEach(err => {
            console.log(`     ${err.severity}: ${err.message} (${err.ruleId})`);
            console.log(`     位置: 第${err.line}行，第${err.column}列`);
          });
        } catch {
          console.log('  ❌ ESLint检查失败:', error.stdout);
        }
      } else {
        console.log('  ❌ ESLint执行失败:', error.message);
      }
    }
    console.log('');
  } else {
    console.log(`⚠️  跳过不存在的文件: ${file}\n`);
  }
});

console.log('🎯 测试TypeScript编译...\n');

// 测试TypeScript编译
try {
  execSync('npx tsc --noEmit --skipLibCheck', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  console.log('✅ TypeScript编译检查通过');
} catch (tsError) {
  console.log('❌ TypeScript编译检查失败:');
  console.log(tsError.stdout || tsError.message);
}

console.log('\n📊 配置总结:');
console.log('- ESLint配置已更新');
console.log('- 支持TypeScript和JavaScript文件');
console.log('- 包含scripts目录');
console.log('- 项目服务已启用');
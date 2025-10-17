#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 简单ESLint配置测试...\n');

// 测试关键文件
const testFiles = [
  'src/modules/brands/entities/brand.entity.ts',
  'src/modules/brands/controllers/brands.controller.ts',
  'src/modules/brands/services/brands.service.ts',
  'scripts/safe-fix-brands-table.js',
];

console.log('📋 检查文件存在性:');
testFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

console.log('\n🔧 运行ESLint检查...');

let hasErrors = false;
testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      console.log(`\n检查: ${file}`);
      execSync(`npx eslint "${file}"`, { stdio: 'inherit' });
      console.log('✅ 通过');
    } catch (error) {
      console.log(`❌ 失败: ${file}`);
      hasErrors = true;
    }
  }
});

console.log('\n🎯 测试TypeScript编译...');
try {
  execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'inherit' });
  console.log('✅ TypeScript编译通过');
} catch (error) {
  console.log('❌ TypeScript编译失败');
  hasErrors = true;
}

console.log('\n📊 测试结果:');
if (hasErrors) {
  console.log('❌ 存在错误，需要修复');
  process.exit(1);
} else {
  console.log('✅ 所有检查通过');
  console.log('- ESLint配置正常工作');
  console.log('- TypeScript编译正常');
  console.log('- 品牌模块文件结构正确');
}
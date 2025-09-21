const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'cursor_shop',
    multipleStatements: true
  });

  try {
    console.log('🚀 开始执行权限表迁移...');
    
    // 读取迁移文件
    const migrationPath = path.join(__dirname, '../database/migrations/20250920_add_permission_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // 执行迁移
    await connection.execute(migrationSQL);
    
    console.log('✅ 权限表迁移执行成功！');
    console.log('📋 已创建的权限数据：');
    
    // 查询权限数据
    const [permissions] = await connection.execute(`
      SELECT id, name, code, type, parent_id 
      FROM permissions 
      ORDER BY id ASC
    `);
    
    permissions.forEach(permission => {
      const indent = permission.parent_id ? '  ' : '';
      console.log(`${indent}- ${permission.name} (${permission.code}) [${permission.type}]`);
    });
    
    // 查询角色数据
    const [roles] = await connection.execute(`
      SELECT r.id, r.name, r.code, COUNT(rp.permission_id) as permission_count
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      GROUP BY r.id, r.name, r.code
    `);
    
    console.log('\n📋 角色信息：');
    roles.forEach(role => {
      console.log(`- ${role.name} (${role.code}): ${role.permission_count} 个权限`);
    });
    
  } catch (error) {
    console.error('❌ 迁移执行失败:', error.message);
    
    // 如果是字段已存在的错误，可能是重复执行
    if (error.message.includes('Duplicate column name')) {
      console.log('⚠️  字段已存在，可能是重复执行迁移');
      
      // 检查权限数据
      try {
        const [count] = await connection.execute('SELECT COUNT(*) as count FROM permissions');
        console.log(`📊 当前权限数量: ${count[0].count}`);
      } catch (e) {
        console.error('无法查询权限数据:', e.message);
      }
    }
  } finally {
    await connection.end();
  }
}

// 运行迁移
runMigration().catch(console.error);
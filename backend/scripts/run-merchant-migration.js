const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  let connection;
  try {
    console.log('🔄 连接数据库...');

    connection = await mysql.createConnection({
      host: '43.139.80.246',
      port: 3306,
      user: 'root',
      password: 'grc@19980713',
      database: 'wechat_mall',
      multipleStatements: true
    });

    console.log('✅ 数据库连接成功\n');

    // 读取迁移SQL文件
    const sqlFile = path.join(__dirname, '../database/migrations/20250914_add_merchant_id_to_tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('🔄 执行迁移脚本...\n');

    // 执行SQL
    await connection.query(sql);

    console.log('✅ 迁移执行成功\n');

    // 验证迁移结果
    console.log('🔍 验证迁移结果...\n');

    const tables = ['admins', 'roles', 'resources', 'resource_categories', 'menus', 'operation_logs', 'user_login_logs'];

    for (const table of tables) {
      try {
        const [columns] = await connection.query(`SHOW COLUMNS FROM ${table} LIKE 'merchant_id'`);
        if (columns.length > 0) {
          console.log(`✅ ${table}: merchant_id 字段已添加`);
        } else {
          console.log(`⚠️  ${table}: merchant_id 字段不存在`);
        }
      } catch (error) {
        console.log(`❌ ${table}: 检查失败 - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

runMigration();

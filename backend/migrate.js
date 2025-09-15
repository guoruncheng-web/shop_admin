const mysql = require('mysql2/promise');

async function runMigration() {
  let connection;
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: '43.139.80.246',
      port: 3306,
      user: 'root',
      password: 'grc@19980713',
      database: 'wechat_mall'
    });

    console.log('Connected to database');

    // 检查字段是否已存在
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'wechat_mall' 
      AND TABLE_NAME = 'menus' 
      AND COLUMN_NAME IN ('created_by', 'updated_by', 'created_by_name', 'updated_by_name')
    `);

    if (columns.length > 0) {
      console.log('Fields already exist:', columns.map(c => c.COLUMN_NAME));
      return;
    }

    // 添加新字段
    console.log('Adding new fields to menus table...');
    await connection.execute(`
      ALTER TABLE menus 
      ADD COLUMN created_by BIGINT NULL COMMENT '创建者用户ID',
      ADD COLUMN updated_by BIGINT NULL COMMENT '更新者用户ID',
      ADD COLUMN created_by_name VARCHAR(100) NULL COMMENT '创建者姓名',
      ADD COLUMN updated_by_name VARCHAR(100) NULL COMMENT '更新者姓名'
    `);

    console.log('Creating indexes...');
    // 创建索引
    await connection.execute(`
      CREATE INDEX idx_menus_created_by ON menus(created_by)
    `);

    await connection.execute(`
      CREATE INDEX idx_menus_updated_by ON menus(updated_by)
    `);

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
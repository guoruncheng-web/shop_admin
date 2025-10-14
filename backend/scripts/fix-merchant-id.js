const mysql = require('mysql2/promise');

async function fixMerchantId() {
  let connection;
  try {
    console.log('🔄 连接数据库...');

    connection = await mysql.createConnection({
      host: '43.139.80.246',
      port: 3306,
      user: 'root',
      password: 'grc@19980713',
      database: 'wechat_mall'
    });

    console.log('✅ 数据库连接成功\n');

    // 需要添加merchant_id的表配置
    const tablesConfig = [
      { name: 'admins', nullable: false, default: 1 },
      { name: 'roles', nullable: false, default: 1 },
      { name: 'resources', nullable: false, default: 1 },
      { name: 'resource_categories', nullable: false, default: 1 },
      { name: 'menus', nullable: false, default: 1 },
      { name: 'operation_logs', nullable: true, default: null },
      { name: 'user_login_logs', nullable: true, default: null }
    ];

    for (const config of tablesConfig) {
      console.log(`\n🔍 检查表: ${config.name}`);

      // 检查表是否存在
      const [tables] = await connection.query(
        `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = 'wechat_mall' AND TABLE_NAME = ?`,
        [config.name]
      );

      if (tables.length === 0) {
        console.log(`⚠️  表 ${config.name} 不存在，跳过`);
        continue;
      }

      // 检查字段是否存在
      const [columns] = await connection.query(
        `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'wechat_mall' AND TABLE_NAME = ? AND COLUMN_NAME = 'merchant_id'`,
        [config.name]
      );

      if (columns.length > 0) {
        console.log(`✅ ${config.name}: merchant_id 字段已存在`);
      } else {
        console.log(`🔧 ${config.name}: 添加 merchant_id 字段...`);

        const nullClause = config.nullable ? 'NULL' : 'NOT NULL';
        const defaultClause = config.default !== null ? `DEFAULT ${config.default}` : '';

        const alterSql = `ALTER TABLE ${config.name} ADD COLUMN merchant_id BIGINT ${nullClause} ${defaultClause} COMMENT '所属商户ID'`;

        try {
          await connection.query(alterSql);
          console.log(`✅ ${config.name}: merchant_id 字段添加成功`);

          // 添加索引
          const indexName = `idx_${config.name}_merchant_id`;
          try {
            await connection.query(`CREATE INDEX ${indexName} ON ${config.name}(merchant_id)`);
            console.log(`✅ ${config.name}: 索引创建成功`);
          } catch (indexError) {
            if (indexError.code === 'ER_DUP_KEYNAME') {
              console.log(`⚠️  ${config.name}: 索引已存在`);
            } else {
              console.log(`⚠️  ${config.name}: 索引创建失败 - ${indexError.message}`);
            }
          }

          // 初始化数据
          if (config.default !== null) {
            const [result] = await connection.query(
              `UPDATE ${config.name} SET merchant_id = ? WHERE merchant_id IS NULL OR merchant_id = 0`,
              [config.default]
            );
            console.log(`✅ ${config.name}: 数据初始化完成，影响行数: ${result.affectedRows}`);
          }

        } catch (error) {
          console.error(`❌ ${config.name}: 添加字段失败 - ${error.message}`);
        }
      }
    }

    console.log('\n\n📊 最终验证...\n');

    for (const config of tablesConfig) {
      const [columns] = await connection.query(
        `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
         FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = 'wechat_mall' AND TABLE_NAME = ? AND COLUMN_NAME = 'merchant_id'`,
        [config.name]
      );

      if (columns.length > 0) {
        const col = columns[0];
        console.log(`✅ ${config.name}: ${col.COLUMN_NAME} ${col.COLUMN_TYPE} ${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'} DEFAULT ${col.COLUMN_DEFAULT}`);
      } else {
        console.log(`❌ ${config.name}: merchant_id 字段不存在`);
      }
    }

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ 数据库连接已关闭');
    }
  }
}

fixMerchantId();

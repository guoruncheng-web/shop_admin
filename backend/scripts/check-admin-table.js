const mysql = require('mysql2/promise');

async function checkAdminTable() {
  try {
    console.log('🔍 检查admin表结构...');
    
    // 创建连接
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wechat_mall'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 检查admin表结构
    console.log('\n🔍 检查admin表结构...');
    const [adminColumns] = await connection.execute('SHOW COLUMNS FROM admin');
    console.log('admin表字段:', adminColumns.map(col => `${col.Field} (${col.Type})`));
    
    // 检查是否有merchantId字段
    const hasMerchantId = adminColumns.some(col => col.Field === 'merchantId');
    console.log('\n是否有merchantId字段:', hasMerchantId);
    
    if (!hasMerchantId) {
      console.log('\n🔧 添加merchantId字段到admin表...');
      try {
        await connection.execute(`
          ALTER TABLE admin
          ADD COLUMN merchantId BIGINT NULL COMMENT '所属商户ID'
        `);
        console.log('✅ admin表添加merchantId字段成功');
        
        // 初始化现有数据的merchantId
        const [updateResult] = await connection.execute(`
          UPDATE admin
          SET merchantId = 1
          WHERE merchantId IS NULL
        `);
        console.log('✅ admin表merchantId初始化完成，影响行数:', updateResult.affectedRows);
        
      } catch (error) {
        console.error('❌ admin表添加字段失败:', error.message);
      }
    }
    
    // 再次检查表结构
    console.log('\n🔍 再次检查admin表结构...');
    const [adminColumnsAfter] = await connection.execute('SHOW COLUMNS FROM admin');
    console.log('admin表字段:', adminColumnsAfter.map(col => `${col.Field} (${col.Type})`));
    
    // 验证数据
    const [adminStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total, 
        COUNT(merchantId) as with_merchant,
        COUNT(*) - COUNT(merchantId) as without_merchant
      FROM admin
    `);
    console.log('\n📊 admin表统计:', adminStats[0]);
    
    await connection.end();
    console.log('\n✅ 数据库连接已关闭');
  } catch (error) {
    console.error('❌ 数据库操作失败:', error);
  }
}

checkAdminTable();
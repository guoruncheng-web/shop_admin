const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  try {
    console.log('🔍 测试数据库连接...');
    
    // 创建连接
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'wechat_mall'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 检查登录日志表结构
    console.log('\n🔍 检查登录日志表结构...');
    const [loginLogsColumns] = await connection.execute('SHOW COLUMNS FROM user_login_logs');
    console.log('登录日志表字段:', loginLogsColumns.map(col => col.Field));
    
    // 检查操作日志表结构
    console.log('\n🔍 检查操作日志表结构...');
    const [operationLogsColumns] = await connection.execute('SHOW COLUMNS FROM operation_logs');
    console.log('操作日志表字段:', operationLogsColumns.map(col => col.Field));
    
    // 尝试添加merchant_id字段到登录日志表
    console.log('\n🔧 尝试添加merchant_id字段到登录日志表...');
    try {
      await connection.execute(`
        ALTER TABLE user_login_logs
        ADD COLUMN merchant_id BIGINT NULL COMMENT '所属商户ID'
      `);
      console.log('✅ 登录日志表添加merchant_id字段成功');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ 登录日志表merchant_id字段已存在');
      } else {
        console.error('❌ 登录日志表添加字段失败:', error.message);
      }
    }
    
    // 尝试添加merchant_id字段到操作日志表
    console.log('\n🔧 尝试添加merchant_id字段到操作日志表...');
    try {
      await connection.execute(`
        ALTER TABLE operation_logs
        ADD COLUMN merchant_id BIGINT NULL COMMENT '所属商户ID'
      `);
      console.log('✅ 操作日志表添加merchant_id字段成功');
    } catch (error) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ 操作日志表merchant_id字段已存在');
      } else {
        console.error('❌ 操作日志表添加字段失败:', error.message);
      }
    }
    
    // 再次检查表结构
    console.log('\n🔍 再次检查登录日志表结构...');
    const [loginLogsColumnsAfter] = await connection.execute('SHOW COLUMNS FROM user_login_logs');
    console.log('登录日志表字段:', loginLogsColumnsAfter.map(col => col.Field));
    
    console.log('\n🔍 再次检查操作日志表结构...');
    const [operationLogsColumnsAfter] = await connection.execute('SHOW COLUMNS FROM operation_logs');
    console.log('操作日志表字段:', operationLogsColumnsAfter.map(col => col.Field));
    
    // 初始化数据
    console.log('\n🔧 初始化登录日志表的merchant_id...');
    const [updateLoginLogs] = await connection.execute(`
      UPDATE user_login_logs
      SET merchant_id = 1
      WHERE merchant_id IS NULL
    `);
    console.log('✅ 登录日志商户ID初始化完成，影响行数:', updateLoginLogs.affectedRows);
    
    console.log('\n🔧 初始化操作日志表的merchant_id...');
    const [updateOperationLogs] = await connection.execute(`
      UPDATE operation_logs
      SET merchant_id = 1
      WHERE merchant_id IS NULL
    `);
    console.log('✅ 操作日志商户ID初始化完成，影响行数:', updateOperationLogs.affectedRows);
    
    // 验证结果
    console.log('\n📊 验证结果...');
    const [loginLogsStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total, 
        COUNT(merchant_id) as with_merchant,
        COUNT(*) - COUNT(merchant_id) as without_merchant
      FROM user_login_logs
    `);
    console.log('登录日志统计:', loginLogsStats[0]);
    
    const [operationLogsStats] = await connection.execute(`
      SELECT 
        COUNT(*) as total, 
        COUNT(merchant_id) as with_merchant,
        COUNT(*) - COUNT(merchant_id) as without_merchant
      FROM operation_logs
    `);
    console.log('操作日志统计:', operationLogsStats[0]);
    
    await connection.end();
    console.log('\n✅ 数据库连接已关闭');
  } catch (error) {
    console.error('❌ 数据库操作失败:', error);
  }
}

testDatabaseConnection();
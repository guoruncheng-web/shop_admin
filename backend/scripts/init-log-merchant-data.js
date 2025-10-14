const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 数据库配置
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'wechat_mall',
  multipleStatements: true
};

async function initLogMerchantData() {
  let connection;
  
  try {
    console.log('🔄 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ 数据库连接成功');
    
    // 读取SQL文件
    const sqlFile = path.join(__dirname, '../database/migrations/20250914_init_log_merchant_data.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('🔄 执行SQL迁移脚本...');
    
    // 执行SQL
    await connection.execute(sql);
    
    console.log('✅ 日志商户数据初始化完成');
    
    // 验证结果
    console.log('🔍 验证迁移结果...');
    
    const [loginLogs] = await connection.execute(
      'SELECT COUNT(*) as total, COUNT(merchant_id) as with_merchant FROM user_login_logs'
    );
    
    const [operationLogs] = await connection.execute(
      'SELECT COUNT(*) as total, COUNT(merchant_id) as with_merchant FROM operation_logs'
    );
    
    console.log('📊 登录日志统计:', {
      总数: loginLogs[0].total,
      有商户ID: loginLogs[0].with_merchant,
      无商户ID: loginLogs[0].total - loginLogs[0].with_merchant
    });
    
    console.log('📊 操作日志统计:', {
      总数: operationLogs[0].total,
      有商户ID: operationLogs[0].with_merchant,
      无商户ID: operationLogs[0].total - operationLogs[0].with_merchant
    });
    
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    if (error.code) {
      console.error('错误代码:', error.code);
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行迁移
initLogMerchantData();
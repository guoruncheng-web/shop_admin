const mysql = require('mysql2/promise');

async function checkAdmins() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: '43.139.80.246',
      port: 3306,
      user: 'root',
      password: 'grc@19980713',
      database: 'wechat_mall'
    });

    console.log('✅ 数据库连接成功\n');

    // 查询所有管理员
    const [admins] = await connection.query(`
      SELECT id, username, real_name, email, status, merchant_id, created_at
      FROM admins
      ORDER BY id
    `);

    console.log('📋 管理员列表:\n');
    console.table(admins);

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkAdmins();

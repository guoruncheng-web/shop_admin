const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function resetPassword() {
  let connection;
  try {
    const username = 'admin';
    const newPassword = 'admin123';
    const rounds = 8; // 从 .env.development 中的 BCRYPT_ROUNDS

    console.log(`🔐 重置用户 ${username} 的密码为: ${newPassword}\n`);

    connection = await mysql.createConnection({
      host: '43.139.80.246',
      port: 3306,
      user: 'root',
      password: 'grc@19980713',
      database: 'wechat_mall'
    });

    console.log('✅ 数据库连接成功');

    // 生成密码哈希
    const hashedPassword = await bcrypt.hash(newPassword, rounds);
    console.log('✅ 密码哈希生成成功');

    // 更新密码
    const [result] = await connection.query(
      'UPDATE admins SET password = ? WHERE username = ?',
      [hashedPassword, username]
    );

    if (result.affectedRows > 0) {
      console.log(`✅ 密码重置成功！\n`);
      console.log('📝 登录信息:');
      console.log(`   用户名: ${username}`);
      console.log(`   密码: ${newPassword}`);
    } else {
      console.log(`❌ 未找到用户: ${username}`);
    }

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

resetPassword();

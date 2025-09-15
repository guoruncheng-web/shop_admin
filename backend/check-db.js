const mysql = require('mysql2/promise');

async function checkUsers() {
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

    console.log('连接数据库成功');

    // 查询用户表
    const [users] = await connection.execute(`
      SELECT id, username, password, status, created_at 
      FROM admins 
      LIMIT 10
    `);

    console.log('用户列表:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, 用户名: ${user.username}, 密码: ${user.password}, 状态: ${user.status}`);
    });

    // 查询菜单表，看看是否有用户跟踪字段
    const [menuColumns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'wechat_mall' 
      AND TABLE_NAME = 'menus' 
      AND COLUMN_NAME IN ('created_by', 'updated_by', 'created_by_name', 'updated_by_name')
    `);

    console.log('\n菜单表用户跟踪字段:');
    menuColumns.forEach(col => {
      console.log(`- ${col.COLUMN_NAME}: ${col.DATA_TYPE}, 可空: ${col.IS_NULLABLE}, 默认值: ${col.COLUMN_DEFAULT}, 注释: ${col.COLUMN_COMMENT}`);
    });

    // 查询现有菜单数据
    const [menus] = await connection.execute(`
      SELECT id, name, title, created_by, updated_by, created_by_name, updated_by_name, created_at, updated_at
      FROM menus 
      LIMIT 3
    `);

    console.log('\n现有菜单数据样例:');
    menus.forEach(menu => {
      console.log(`- ID: ${menu.id}, 名称: ${menu.name}, 创建者: ${menu.created_by}(${menu.created_by_name}), 更新者: ${menu.updated_by}(${menu.updated_by_name})`);
    });

  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUsers();
const mysql = require('mysql2/promise');

async function checkMenusStructure() {
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

    // 查看 menus 表结构
    console.log('📋 menus 表结构:\n');
    const [columns] = await connection.query('SHOW COLUMNS FROM menus');
    console.table(columns.map(c => ({
      Field: c.Field,
      Type: c.Type,
      Null: c.Null,
      Key: c.Key,
      Default: c.Default
    })));

    // 查看几条示例数据
    console.log('\n📋 menus 表示例数据:\n');
    const [menus] = await connection.query('SELECT * FROM menus LIMIT 5');
    console.table(menus);

    // 查询 admin 用户的角色关联的菜单
    console.log('\n📋 admin 角色关联的菜单:\n');
    const [roleMenus] = await connection.query(`
      SELECT m.*
      FROM admins a
      JOIN admin_roles ar ON a.id = ar.admin_id
      JOIN role_menus rm ON ar.role_id = rm.role_id
      JOIN menus m ON rm.menu_id = m.id
      WHERE a.username = 'admin'
      ORDER BY m.id
    `);
    console.log(`共 ${roleMenus.length} 个菜单`);
    if (roleMenus.length > 0) {
      console.table(roleMenus.slice(0, 10)); // 只显示前10条
    }

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkMenusStructure();

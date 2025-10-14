const mysql = require('mysql2/promise');

async function checkMenuPermissions() {
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

    // 1. 查询登录日志菜单
    console.log('📋 1. 查询登录日志菜单:\n');
    const [loginLogMenus] = await connection.query(`
      SELECT id, name, type, path, button_key, authority
      FROM menus
      WHERE name LIKE '%登录日志%'
    `);
    console.table(loginLogMenus);

    // 2. 查询 admin 角色关联的所有菜单及其权限字段
    console.log('\n📋 2. admin 角色关联的菜单的权限相关字段:\n');
    const [roleMenus] = await connection.query(`
      SELECT m.id, m.name, m.type, m.path, m.button_key, m.authority
      FROM admins a
      JOIN admin_roles ar ON a.id = ar.admin_id
      JOIN role_menus rm ON ar.role_id = rm.role_id
      JOIN menus m ON rm.menu_id = m.id
      WHERE a.username = 'admin'
      ORDER BY m.type, m.id
    `);
    console.log(`共 ${roleMenus.length} 个菜单\n`);
    console.table(roleMenus);

    // 3. 检查是否需要为登录日志菜单添加权限标识
    console.log('\n📋 3. 建议操作:\n');

    if (loginLogMenus.length === 0) {
      console.log('❌ 没有找到登录日志菜单');
    } else {
      const loginLogMenu = loginLogMenus[0];
      if (!loginLogMenu.button_key) {
        console.log('⚠️  登录日志菜单缺少 button_key 权限标识');
        console.log('建议：将登录日志菜单的 type 设置为 3 (按钮级别)');
        console.log('并设置 button_key = "system:login-log:view"');
      } else {
        console.log(`✅ 登录日志菜单已有权限标识: ${loginLogMenu.button_key}`);
      }
    }

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkMenuPermissions();

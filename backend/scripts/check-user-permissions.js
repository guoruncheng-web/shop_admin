const mysql = require('mysql2/promise');

async function checkPermissions() {
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

    // 1. 查询 admin 用户的角色
    console.log('📋 1. 查询 admin 用户的角色:\n');
    const [adminRoles] = await connection.query(`
      SELECT r.id, r.name, r.code, r.description
      FROM admins a
      JOIN admin_roles ar ON a.id = ar.admin_id
      JOIN roles r ON ar.role_id = r.id
      WHERE a.username = 'admin'
    `);
    console.table(adminRoles);

    if (adminRoles.length === 0) {
      console.log('⚠️  admin 用户没有关联任何角色\n');
      return;
    }

    // 2. 查询角色的权限
    console.log('\n📋 2. 查询角色关联的菜单权限:\n');
    for (const role of adminRoles) {
      const [menus] = await connection.query(`
        SELECT m.id, m.name, m.type, m.permission_code, m.path
        FROM role_menus rm
        JOIN menus m ON rm.menu_id = m.id
        WHERE rm.role_id = ?
        ORDER BY m.type, m.sort_order
      `, [role.id]);

      console.log(`\n角色: ${role.name} (${role.code})`);
      console.table(menus);
    }

    // 3. 查询登录日志相关的菜单
    console.log('\n📋 3. 查询登录日志相关的菜单:\n');
    const [loginLogMenus] = await connection.query(`
      SELECT id, name, type, permission_code, path, parent_id
      FROM menus
      WHERE name LIKE '%登录日志%' OR permission_code LIKE '%login-log%'
      ORDER BY id
    `);
    console.table(loginLogMenus);

    // 4. 检查是否有 system:login-log:view 权限
    console.log('\n📋 4. 检查是否有 system:login-log:view 权限:\n');
    const [hasPermission] = await connection.query(`
      SELECT COUNT(*) as count
      FROM admins a
      JOIN admin_roles ar ON a.id = ar.admin_id
      JOIN role_menus rm ON ar.role_id = rm.role_id
      JOIN menus m ON rm.menu_id = m.id
      WHERE a.username = 'admin'
      AND m.permission_code = 'system:login-log:view'
    `);

    if (hasPermission[0].count > 0) {
      console.log('✅ admin 用户有 system:login-log:view 权限');
    } else {
      console.log('❌ admin 用户没有 system:login-log:view 权限');
      console.log('需要在菜单管理中添加该权限并分配给角色');
    }

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkPermissions();

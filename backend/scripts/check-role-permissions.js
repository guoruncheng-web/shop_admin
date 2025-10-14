const mysql = require('mysql2/promise');

async function checkRolePermissions() {
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

    // 1. 检查 permissions 表是否存在
    const [tables] = await connection.query(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = 'wechat_mall'
      AND TABLE_NAME LIKE '%permission%'
    `);
    console.log('📋 1. 权限相关的表:\n');
    console.table(tables);

    if (tables.length === 0) {
      console.log('❌ 没有找到 permissions 表');
      return;
    }

    // 2. 查询 super_o_admin 角色的权限
    console.log('\n📋 2. super_o_admin 角色的权限:\n');

    // 先查询角色ID
    const [roles] = await connection.query(`
      SELECT id, code, name FROM roles WHERE code = 'super_o_admin'
    `);

    if (roles.length === 0) {
      console.log('❌ 找不到 super_o_admin 角色');
      return;
    }

    const roleId = roles[0].id;
    console.log(`角色ID: ${roleId}, 名称: ${roles[0].name}\n`);

    // 查询角色-权限关联表
    const [roleTables] = await connection.query(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = 'wechat_mall'
      AND TABLE_NAME LIKE 'role%permission%'
    `);

    console.log('角色-权限关联表:');
    console.table(roleTables);

    if (roleTables.length > 0) {
      const tableName = roleTables[0].TABLE_NAME;
      const [rolePermissions] = await connection.query(`
        SELECT p.*
        FROM ${tableName} rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ?
      `, [roleId]);

      console.log(`\n角色关联的权限数量: ${rolePermissions.length}`);
      if (rolePermissions.length > 0) {
        console.table(rolePermissions);
      }

      // 3. 检查是否有 system:login-log:view 权限
      console.log('\n📋 3. 检查是否有 system:login-log:view 权限:\n');
      const hasPermission = rolePermissions.some(p => p.code === 'system:login-log:view');

      if (hasPermission) {
        console.log('✅ 角色有 system:login-log:view 权限');
      } else {
        console.log('❌ 角色没有 system:login-log:view 权限');

        // 查询所有与 login-log 相关的权限
        const [loginLogPerms] = await connection.query(`
          SELECT * FROM permissions WHERE code LIKE '%login-log%'
        `);

        if (loginLogPerms.length > 0) {
          console.log('\n数据库中存在的 login-log 相关权限:');
          console.table(loginLogPerms);
          console.log('\n需要将这些权限关联到角色');
        } else {
          console.log('\n数据库中不存在 login-log 相关权限，需要创建');
        }
      }
    }

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkRolePermissions();

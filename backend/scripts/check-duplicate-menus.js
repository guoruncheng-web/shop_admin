const mysql = require('mysql2/promise');

async function checkDuplicateMenus() {
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

    // 1. 查询 admin 用户关联的所有菜单
    console.log('📋 1. admin 用户关联的所有菜单:\n');
    const [menus] = await connection.query(`
      SELECT m.id, m.name, m.path, m.type, m.parent_id, m.status, m.created_at
      FROM admins a
      JOIN admin_roles ar ON a.id = ar.admin_id
      JOIN role_menus rm ON ar.role_id = rm.role_id
      JOIN menus m ON rm.menu_id = m.id
      WHERE a.username = 'admin'
      ORDER BY m.name, m.id
    `);

    console.log(`共 ${menus.length} 个菜单\n`);

    // 2. 查找重复的菜单
    console.log('📋 2. 检查重复的菜单:\n');
    const menuNames = {};
    menus.forEach(menu => {
      if (!menuNames[menu.name]) {
        menuNames[menu.name] = [];
      }
      menuNames[menu.name].push(menu);
    });

    let hasDuplicates = false;
    Object.keys(menuNames).forEach(name => {
      if (menuNames[name].length > 1) {
        hasDuplicates = true;
        console.log(`⚠️  重复菜单: ${name} (${menuNames[name].length} 个)`);
        console.table(menuNames[name].map(m => ({
          ID: m.id,
          名称: m.name,
          路径: m.path,
          类型: m.type === 1 ? '目录' : m.type === 2 ? '菜单' : '按钮',
          父级ID: m.parent_id,
          状态: m.status === 1 ? '启用' : '禁用',
          创建时间: m.created_at
        })));
        console.log('');
      }
    });

    if (!hasDuplicates) {
      console.log('✅ 没有发现重复的菜单');
    }

    // 3. 查看 role_menus 关联表
    console.log('\n📋 3. 检查 role_menus 关联表中的菜单管理:\n');
    const [roleMenus] = await connection.query(`
      SELECT rm.id, rm.role_id, rm.menu_id, r.name as role_name, m.name as menu_name, m.path
      FROM role_menus rm
      JOIN roles r ON rm.role_id = r.id
      JOIN menus m ON rm.menu_id = m.id
      WHERE r.code = 'super_o_admin' AND m.name = '菜单管理'
      ORDER BY rm.id
    `);

    console.log(`super_o_admin 角色关联的"菜单管理"数量: ${roleMenus.length}\n`);
    console.table(roleMenus);

    // 4. 查询所有名为"菜单管理"的菜单
    console.log('\n📋 4. 数据库中所有"菜单管理"菜单:\n');
    const [allMenuManage] = await connection.query(`
      SELECT id, name, path, type, parent_id, status, created_at, created_by_name
      FROM menus
      WHERE name = '菜单管理'
      ORDER BY id
    `);

    console.table(allMenuManage);

    // 5. 建议
    if (roleMenus.length > 1) {
      console.log('\n💡 建议操作:\n');
      console.log('删除重复的 role_menus 关联记录，保留最早的那个:');

      const idsToDelete = roleMenus.slice(1).map(rm => rm.id);
      console.log(`DELETE FROM role_menus WHERE id IN (${idsToDelete.join(', ')});`);

      console.log('\n或者删除重复的菜单记录（如果菜单本身重复）:');
      if (allMenuManage.length > 1) {
        const menuIdsToDelete = allMenuManage.slice(1).map(m => m.id);
        console.log(`DELETE FROM role_menus WHERE menu_id IN (${menuIdsToDelete.join(', ')});`);
        console.log(`DELETE FROM menus WHERE id IN (${menuIdsToDelete.join(', ')});`);
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

checkDuplicateMenus();

const mysql = require('mysql2/promise');

async function removeDuplicateMenus() {
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

    // 删除重复的菜单（保留 ID=11 的原始菜单）
    const menuIdsToDelete = [42011, 42012];

    console.log('📋 准备删除重复的菜单:\n');
    console.log(`菜单 ID: ${menuIdsToDelete.join(', ')}\n`);

    // 1. 先删除 role_menus 关联
    console.log('1️⃣ 删除 role_menus 关联记录...');
    const [roleMenuResult] = await connection.query(
      'DELETE FROM role_menus WHERE menu_id IN (?)',
      [menuIdsToDelete]
    );
    console.log(`✅ 删除了 ${roleMenuResult.affectedRows} 条 role_menus 记录\n`);

    // 2. 删除菜单记录
    console.log('2️⃣ 删除重复的菜单记录...');
    const [menuResult] = await connection.query(
      'DELETE FROM menus WHERE id IN (?)',
      [menuIdsToDelete]
    );
    console.log(`✅ 删除了 ${menuResult.affectedRows} 条菜单记录\n`);

    // 3. 验证结果
    console.log('3️⃣ 验证删除结果:\n');

    const [remainingMenus] = await connection.query(`
      SELECT id, name, path
      FROM menus
      WHERE name = '菜单管理'
    `);

    console.log('剩余的"菜单管理"菜单:');
    console.table(remainingMenus);

    const [roleMenuCount] = await connection.query(`
      SELECT COUNT(*) as count
      FROM role_menus rm
      JOIN menus m ON rm.menu_id = m.id
      WHERE rm.role_id = 1 AND m.name = '菜单管理'
    `);

    console.log(`\nsuper_o_admin 角色关联的"菜单管理"数量: ${roleMenuCount[0].count}`);

    if (remainingMenus.length === 1 && roleMenuCount[0].count === 1) {
      console.log('\n✅ 重复菜单清理成功！');
    } else {
      console.log('\n⚠️  可能还存在问题，请检查');
    }

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

removeDuplicateMenus();

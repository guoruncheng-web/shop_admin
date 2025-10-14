const mysql = require('mysql2/promise');

async function addMenuManageButtons() {
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

    // 菜单管理的 ID
    const menuManageId = 11;
    const merchantId = 1;
    const roleId = 1; // super_o_admin

    // 菜单管理的按钮权限
    const buttonsToAdd = [
      {
        name: '查看菜单',
        buttonKey: 'system:menu:view',
        title: '查看'
      },
      {
        name: '新增菜单',
        buttonKey: 'system:menu:add',
        title: '新增'
      },
      {
        name: '编辑菜单',
        buttonKey: 'system:menu:edit',
        title: '编辑'
      },
      {
        name: '删除菜单',
        buttonKey: 'system:menu:delete',
        title: '删除'
      }
    ];

    console.log('📋 准备为"菜单管理"添加按钮权限:\n');

    for (const button of buttonsToAdd) {
      // 检查是否已存在
      const [existing] = await connection.query(
        'SELECT id FROM menus WHERE parent_id = ? AND button_key = ?',
        [menuManageId, button.buttonKey]
      );

      if (existing.length > 0) {
        console.log(`⚠️  按钮已存在: ${button.buttonKey} (ID: ${existing[0].id})`);

        // 检查是否已关联到角色
        const [roleRelation] = await connection.query(
          'SELECT id FROM role_menus WHERE role_id = ? AND menu_id = ?',
          [roleId, existing[0].id]
        );

        if (roleRelation.length === 0) {
          await connection.query(
            'INSERT INTO role_menus (role_id, menu_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
            [roleId, existing[0].id]
          );
          console.log(`   ✅ 已关联到角色 super_o_admin`);
        } else {
          console.log(`   ℹ️  已关联到角色`);
        }
        continue;
      }

      // 插入按钮菜单
      const [result] = await connection.query(`
        INSERT INTO menus (
          merchant_id, name, path, component, title, icon,
          order_num, type, status, parent_id, level, button_key, created_at, updated_at
        ) VALUES (?, ?, NULL, NULL, ?, NULL, 1, 3, 1, ?, 3, ?, NOW(), NOW())
      `, [
        merchantId,
        button.name,
        button.title,
        menuManageId,
        button.buttonKey
      ]);

      const buttonId = result.insertId;
      console.log(`✅ 添加成功: ${button.buttonKey} (ID: ${buttonId})`);

      // 关联到 super_o_admin 角色
      await connection.query(
        'INSERT INTO role_menus (role_id, menu_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [roleId, buttonId]
      );
      console.log(`   ✅ 已关联到角色 super_o_admin`);
    }

    console.log('\n📋 验证结果:\n');

    // 查询添加的按钮
    const [buttons] = await connection.query(`
      SELECT m.id, m.name, m.button_key, COUNT(rm.id) as role_count
      FROM menus m
      LEFT JOIN role_menus rm ON m.id = rm.menu_id
      WHERE m.parent_id = ? AND m.type = 3
      GROUP BY m.id
      ORDER BY m.id
    `, [menuManageId]);

    console.table(buttons);

    console.log('\n✅ 操作完成！');

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addMenuManageButtons();

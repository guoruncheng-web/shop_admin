const mysql = require('mysql2/promise');

async function addLogMenuButtons() {
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

    // 1. 查询登录日志和操作日志菜单
    const [logMenus] = await connection.query(`
      SELECT id, name, merchant_id
      FROM menus
      WHERE id IN (42006, 42008)
    `);

    console.log('📋 1. 日志菜单:\n');
    console.table(logMenus);

    // 2. 为每个日志菜单添加按钮
    const buttonsToAdd = [
      {
        parentId: 42006,
        name: '查看登录日志',
        buttonKey: 'system:login-log:view',
        title: '查看',
        merchantId: 1
      },
      {
        parentId: 42006,
        name: '删除登录日志',
        buttonKey: 'system:login-log:delete',
        title: '删除',
        merchantId: 1
      },
      {
        parentId: 42006,
        name: '清理登录日志',
        buttonKey: 'system:login-log:clear',
        title: '清理',
        merchantId: 1
      },
      {
        parentId: 42008,
        name: '查看操作日志',
        buttonKey: 'system:operation-log:view',
        title: '查看',
        merchantId: 1
      },
      {
        parentId: 42008,
        name: '删除操作日志',
        buttonKey: 'system:operation-log:delete',
        title: '删除',
        merchantId: 1
      }
    ];

    console.log('\n📋 2. 添加按钮菜单:\n');

    for (const button of buttonsToAdd) {
      // 检查是否已存在
      const [existing] = await connection.query(
        'SELECT id FROM menus WHERE parent_id = ? AND button_key = ?',
        [button.parentId, button.buttonKey]
      );

      if (existing.length > 0) {
        console.log(`⚠️  按钮已存在: ${button.buttonKey}`);
        continue;
      }

      // 插入按钮菜单
      const [result] = await connection.query(`
        INSERT INTO menus (
          merchant_id, name, path, component, title, icon,
          order_num, type, status, parent_id, level, button_key, created_at, updated_at
        ) VALUES (?, ?, NULL, NULL, ?, NULL, 1, 3, 1, ?, 2, ?, NOW(), NOW())
      `, [
        button.merchantId,
        button.name,
        button.title,
        button.parentId,
        button.buttonKey
      ]);

      const buttonId = result.insertId;
      console.log(`✅ 添加成功: ${button.buttonKey} (ID: ${buttonId})`);

      // 3. 关联到 super_o_admin 角色
      const [roleResult] = await connection.query(
        'SELECT id FROM roles WHERE code = "super_o_admin"'
      );

      if (roleResult.length > 0) {
        const roleId = roleResult[0].id;

        // 检查是否已关联
        const [existingRelation] = await connection.query(
          'SELECT * FROM role_menus WHERE role_id = ? AND menu_id = ?',
          [roleId, buttonId]
        );

        if (existingRelation.length === 0) {
          await connection.query(
            'INSERT INTO role_menus (role_id, menu_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
            [roleId, buttonId]
          );
          console.log(`   ✅ 已关联到角色 super_o_admin`);
        }
      }
    }

    console.log('\n📋 3. 验证结果:\n');

    // 查询添加的按钮
    const [buttons] = await connection.query(`
      SELECT m.id, m.name, m.button_key, m.parent_id, COUNT(rm.id) as role_count
      FROM menus m
      LEFT JOIN role_menus rm ON m.id = rm.menu_id
      WHERE m.parent_id IN (42006, 42008) AND m.type = 3
      GROUP BY m.id
      ORDER BY m.parent_id, m.id
    `);

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

addLogMenuButtons();

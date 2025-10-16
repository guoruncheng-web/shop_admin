const mysql = require('mysql2/promise');

async function testMenuMerchantFilter() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: '43.139.80.246',
      port: 3306,
      user: 'root',
      password: 'grc@19980713',
      database: 'wechat_mall'
    });

    console.log('=== 测试菜单商户过滤功能 ===\n');

    // 模拟商户ID为1的用户查询
    const currentUser = { merchantId: 1, userId: 1, username: 'test_user' };
    
    console.log(`当前用户信息:`, currentUser);
    console.log(`查询商户ID为 ${currentUser.merchantId} 的菜单\n`);

    // 1. 测试基础查询（模拟 getMenus 方法）
    console.log('1. 基础菜单查询 (模拟 getMenus 方法):');
    const [basicQuery] = await connection.execute(`
      SELECT id, name, merchant_id, type, status, parent_id, order_num
      FROM menus 
      WHERE merchant_id = ?
      ORDER BY order_num ASC
      LIMIT 5
    `, [currentUser.merchantId]);
    console.log('查询结果:', basicQuery);
    console.log(`查询到 ${basicQuery.length} 条记录\n`);

    // 2. 测试带条件的查询（模拟带参数的 getMenus 方法）
    console.log('2. 带条件的菜单查询 (type=1 的目录):');
    const [conditionalQuery] = await connection.execute(`
      SELECT id, name, merchant_id, type, status, parent_id, order_num
      FROM menus 
      WHERE merchant_id = ? AND type = ?
      ORDER BY order_num ASC
    `, [currentUser.merchantId, 1]);
    console.log('查询结果:', conditionalQuery);
    console.log(`查询到 ${conditionalQuery.length} 条记录\n`);

    // 3. 测试菜单树查询（模拟 getMenuTree 方法）
    console.log('3. 菜单树查询 (模拟 getMenuTree 方法):');
    const [treeQuery] = await connection.execute(`
      SELECT id, name, merchant_id, type, status, parent_id, order_num
      FROM menus 
      WHERE merchant_id = ?
      ORDER BY order_num ASC
    `, [currentUser.merchantId]);
    console.log(`查询到 ${treeQuery.length} 条记录`);
    
    // 构建简单的树形结构
    const buildTree = (menus) => {
      const menuMap = new Map();
      const rootMenus = [];
      
      menus.forEach(menu => {
        menuMap.set(menu.id, { ...menu, children: [] });
      });
      
      menus.forEach(menu => {
        const menuItem = menuMap.get(menu.id);
        if (menu.parent_id && menuMap.has(menu.parent_id)) {
          const parent = menuMap.get(menu.parent_id);
          parent.children.push(menuItem);
        } else {
          rootMenus.push(menuItem);
        }
      });
      
      return rootMenus;
    };
    
    const menuTree = buildTree(treeQuery);
    console.log('构建的菜单树根节点数量:', menuTree.length);
    console.log('根节点菜单:', menuTree.map(node => ({ id: node.id, name: node.name, type: node.type })));
    console.log();

    // 4. 对比：查询所有菜单（不限制商户）
    console.log('4. 对比查询：所有菜单（不限制商户）:');
    const [allMenus] = await connection.execute(`
      SELECT id, name, merchant_id, type, status, parent_id, order_num
      FROM menus 
      ORDER BY merchant_id, order_num ASC
      LIMIT 10
    `);
    console.log('前10条所有菜单记录:', allMenus);
    console.log();

    // 5. 检查是否有商户ID不匹配的情况
    console.log('5. 检查数据一致性:');
    const [inconsistentData] = await connection.execute(`
      SELECT COUNT(*) as count FROM menus WHERE merchant_id != 1
    `);
    console.log(`非商户1的菜单数量: ${inconsistentData[0].count}`);

    const [merchant9Data] = await connection.execute(`
      SELECT id, name, merchant_id FROM menus WHERE merchant_id = 9
    `);
    console.log('商户9的菜单:', merchant9Data);

  } catch (error) {
    console.error('测试过程中出错:', error);
  } finally {
    if (connection) await connection.end();
  }
}

testMenuMerchantFilter();
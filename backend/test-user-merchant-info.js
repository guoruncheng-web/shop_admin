const mysql = require('mysql2/promise');

async function testUserMerchantInfo() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: '43.139.80.246',
      port: 3306,
      user: 'root',
      password: 'grc@19980713',
      database: 'wechat_mall'
    });

    console.log('=== 检查用户商户信息 ===\n');

    // 1. 查看所有用户及其商户信息
    console.log('1. 查看用户表中的商户信息:');
    const [users] = await connection.execute(`
      SELECT id, username, real_name, merchant_id 
      FROM admins 
      WHERE id IN (1, 2, 3, 4, 5)
      ORDER BY id
    `);
    console.log('用户信息:', users);
    console.log();

    // 2. 查看商户表信息
    console.log('2. 查看商户表信息:');
    const [merchants] = await connection.execute(`
      SELECT id, merchant_name, merchant_code, status 
      FROM merchants 
      WHERE id IN (1, 9)
      ORDER BY id
    `);
    console.log('商户信息:', merchants);
    console.log();

    // 3. 模拟不同用户查询菜单
    console.log('3. 模拟不同用户查询菜单:');
    
    for (const user of users) {
      console.log(`\n--- 用户 ${user.username} (ID: ${user.id}, 商户ID: ${user.merchant_id}) ---`);
      
      const [userMenus] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM menus 
        WHERE merchant_id = ?
      `, [user.merchant_id]);
      
      console.log(`可访问的菜单数量: ${userMenus[0].count}`);
      
      // 查询前3个菜单
      const [sampleMenus] = await connection.execute(`
        SELECT id, name, type, parent_id, order_num
        FROM menus 
        WHERE merchant_id = ?
        ORDER BY order_num ASC, id ASC
        LIMIT 3
      `, [user.merchant_id]);
      
      console.log('前3个菜单:', sampleMenus);
    }

    // 4. 检查菜单排序问题
    console.log('\n4. 检查菜单排序问题:');
    const [orderCheck] = await connection.execute(`
      SELECT id, name, order_num, parent_id
      FROM menus 
      WHERE merchant_id = 1 AND parent_id IS NULL
      ORDER BY order_num ASC, id ASC
    `);
    console.log('商户1的根菜单排序:', orderCheck);

  } catch (error) {
    console.error('检查过程中出错:', error);
  } finally {
    if (connection) await connection.end();
  }
}

testUserMerchantInfo();
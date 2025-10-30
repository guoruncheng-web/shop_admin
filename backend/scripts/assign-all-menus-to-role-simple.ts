import * as mysql from 'mysql2/promise';

// 加载环境变量
require('dotenv').config({ path: '.env.development' });

/**
 * 为指定角色分配该角色所属商户的所有菜单权限
 * @param roleId 角色ID
 */
async function assignAllMenusToRole(roleId: number) {
  let connection: mysql.Connection | null = null;

  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    });

    console.log('✅ 数据库连接成功');

    // 1. 查询角色信息
    const [roleRows] = (await connection.execute(
      `SELECT r.id, r.name, r.merchant_id, m.merchant_name
       FROM roles r
       LEFT JOIN merchants m ON r.merchant_id = m.id
       WHERE r.id = ?`,
      [roleId],
    )) as [any[], any];

    if (roleRows.length === 0) {
      console.error(`❌ 角色ID ${roleId} 不存在`);
      return;
    }

    const role = roleRows[0];
    console.log(`\n📋 角色信息:`);
    console.log(`   角色ID: ${role.id}`);
    console.log(`   角色名称: ${role.name}`);
    console.log(`   商户ID: ${role.merchant_id}`);
    console.log(`   商户名称: ${role.merchant_name || '未知'}`);

    // 2. 查询该商户的所有菜单
    const [menuRows] = (await connection.execute(
      'SELECT id, name, type FROM menus WHERE merchant_id = ? ORDER BY id',
      [role.merchant_id],
    )) as [any[], any];

    if (menuRows.length === 0) {
      console.log(`\n⚠️  商户ID ${role.merchant_id} 没有任何菜单`);
      return;
    }

    console.log(`\n📁 找到 ${menuRows.length} 个菜单`);

    // 3. 删除该角色现有的所有菜单权限
    const [deleteResult] = (await connection.execute(
      'DELETE FROM role_menus WHERE role_id = ?',
      [roleId],
    )) as [any, any];

    console.log(
      `\n🗑️  删除了 ${(deleteResult as any).affectedRows || 0} 条现有权限关联`,
    );

    // 4. 批量插入新的菜单权限
    const values = menuRows.map((menu: any) => [roleId, menu.id]);
    const placeholders = menuRows.map(() => '(?, ?)').join(', ');
    const flatValues = values.flat();

    await connection.execute(
      `INSERT INTO role_menus (role_id, menu_id) VALUES ${placeholders}`,
      flatValues,
    );

    console.log(
      `\n✅ 成功为角色 "${role.name}" 分配了 ${menuRows.length} 个菜单权限`,
    );

    // 5. 显示分配的菜单列表
    console.log(`\n📝 已分配的菜单列表:`);
    menuRows.forEach((menu: any, index: number) => {
      const prefix = menu.type === 1 ? '📂' : menu.type === 2 ? '📄' : '🔘';
      console.log(`   ${index + 1}. ${prefix} ${menu.name} (ID: ${menu.id})`);
    });

    console.log(`\n✨ 操作完成！`);
  } catch (error) {
    console.error(
      '❌ 操作失败:',
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
使用方法:
  npm run script:assign-menus <角色ID>

示例:
  npm run script:assign-menus 1

说明:
  该脚本会为指定角色分配该角色所属商户的所有菜单权限
  会先删除该角色现有的所有菜单权限，然后重新分配
    `);
    process.exit(1);
  }

  const roleId = parseInt(args[0]);

  if (isNaN(roleId)) {
    console.error('❌ 角色ID必须是数字');
    process.exit(1);
  }

  await assignAllMenusToRole(roleId);
}

// 执行脚本
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('脚本执行失败:', error);
    process.exit(1);
  });

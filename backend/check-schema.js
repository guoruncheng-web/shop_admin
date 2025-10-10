const mysql = require('mysql2/promise');

async function checkSchema() {
  const connection = await mysql.createConnection({
    host: '43.139.80.246',
    user: 'root',
    password: 'grc@19980713',
    database: 'wechat_mall'
  });

  try {
    console.log('🔍 检查 roles 表结构...');
    const [rolesColumns] = await connection.query('DESCRIBE roles');
    console.log('\nroles 表字段:');
    console.table(rolesColumns.map(c => ({ 字段: c.Field, 类型: c.Type, 默认值: c.Default })));
    
    const hasMerchantId = rolesColumns.some(c => c.Field === 'merchant_id');
    if (hasMerchantId) {
      console.log('✅ roles 表已有 merchant_id 字段');
    } else {
      console.log('❌ roles 表缺少 merchant_id 字段');
    }

    console.log('\n🔍 检查 admins 表结构...');
    const [adminsColumns] = await connection.query('DESCRIBE admins');
    const hasAdminMerchantId = adminsColumns.some(c => c.Field === 'merchant_id');
    if (hasAdminMerchantId) {
      console.log('✅ admins 表已有 merchant_id 字段');
    } else {
      console.log('❌ admins 表缺少 merchant_id 字段');
    }

    console.log('\n🔍 查询商户ID=3的数据...');
    const [admins] = await connection.query('SELECT id, username, real_name, merchant_id FROM admins WHERE merchant_id = 3');
    console.log(`\n管理员记录 (${admins.length} 条):`);
    if (admins.length > 0) {
      console.table(admins);
    } else {
      console.log('  未找到数据');
    }

    const [roles] = await connection.query('SELECT id, name, code, merchant_id FROM roles WHERE merchant_id = 3');
    console.log(`\n角色记录 (${roles.length} 条):`);
    if (roles.length > 0) {
      console.table(roles);
    } else {
      console.log('  未找到数据');
    }

    if (admins.length > 0 && roles.length > 0) {
      const [adminRoles] = await connection.query('SELECT * FROM admin_roles WHERE admin_id = ?', [admins[0].id]);
      console.log(`\n管理员-角色绑定 (${adminRoles.length} 条):`);
      if (adminRoles.length > 0) {
        console.table(adminRoles);
      } else {
        console.log('  未找到绑定');
      }

      const [rolePerms] = await connection.query('SELECT COUNT(*) as count FROM role_permissions WHERE role_id = ?', [roles[0].id]);
      console.log(`\n角色权限数量: ${rolePerms[0].count}`);
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
  } finally {
    await connection.end();
  }
}

checkSchema();

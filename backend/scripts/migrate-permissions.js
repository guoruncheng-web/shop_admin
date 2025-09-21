const mysql = require('mysql2/promise');

async function runMigration() {
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root123',
      database: 'wechat_mall_dev'
    });

    console.log('✅ 数据库连接成功');

    // 检查当前权限表结构
    console.log('\n📋 检查当前权限表结构...');
    const [columns] = await connection.execute('DESCRIBE permissions');
    console.log('当前字段:', columns.map(col => col.Field));

    // 检查是否已存在 type 字段
    const hasTypeField = columns.some(col => col.Field === 'type');
    const hasParentIdField = columns.some(col => col.Field === 'parentId');
    const hasSortField = columns.some(col => col.Field === 'sort');
    const hasIconField = columns.some(col => col.Field === 'icon');
    const hasPathField = columns.some(col => col.Field === 'path');

    // 添加缺失的字段
    if (!hasTypeField) {
      console.log('➕ 添加 type 字段...');
      await connection.execute(`
        ALTER TABLE permissions 
        ADD COLUMN type VARCHAR(20) NOT NULL DEFAULT 'menu' 
        COMMENT '权限类型：menu-菜单，button-按钮，api-接口'
      `);
    }

    if (!hasParentIdField) {
      console.log('➕ 添加 parentId 字段...');
      await connection.execute(`
        ALTER TABLE permissions 
        ADD COLUMN parentId INT NULL 
        COMMENT '父级权限ID'
      `);
    }

    if (!hasSortField) {
      console.log('➕ 添加 sort 字段...');
      await connection.execute(`
        ALTER TABLE permissions 
        ADD COLUMN sort INT NOT NULL DEFAULT 0 
        COMMENT '排序'
      `);
    }

    if (!hasIconField) {
      console.log('➕ 添加 icon 字段...');
      await connection.execute(`
        ALTER TABLE permissions 
        ADD COLUMN icon VARCHAR(100) NULL 
        COMMENT '图标'
      `);
    }

    if (!hasPathField) {
      console.log('➕ 添加 path 字段...');
      await connection.execute(`
        ALTER TABLE permissions 
        ADD COLUMN path VARCHAR(200) NULL 
        COMMENT '路径'
      `);
    }

    // 检查是否有数据，如果没有则插入初始数据
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM permissions');
    if (rows[0].count === 0) {
      console.log('\n📝 插入初始权限数据...');
      
      const initialPermissions = [
        // 系统管理
        { name: '系统管理', code: 'system', type: 'menu', parentId: null, sort: 1, icon: '🔧', path: '/system' },
        { name: '用户管理', code: 'system:user', type: 'menu', parentId: 1, sort: 1, icon: '👥', path: '/system/user' },
        { name: '角色管理', code: 'system:role', type: 'menu', parentId: 1, sort: 2, icon: '🎭', path: '/system/role' },
        { name: '权限管理', code: 'system:permission', type: 'menu', parentId: 1, sort: 3, icon: '🔐', path: '/system/permission' },
        
        // 用户管理按钮权限
        { name: '新增用户', code: 'system:user:create', type: 'button', parentId: 2, sort: 1, icon: '➕', path: null },
        { name: '编辑用户', code: 'system:user:update', type: 'button', parentId: 2, sort: 2, icon: '✏️', path: null },
        { name: '删除用户', code: 'system:user:delete', type: 'button', parentId: 2, sort: 3, icon: '🗑️', path: null },
        
        // 角色管理按钮权限
        { name: '新增角色', code: 'system:role:create', type: 'button', parentId: 3, sort: 1, icon: '➕', path: null },
        { name: '编辑角色', code: 'system:role:update', type: 'button', parentId: 3, sort: 2, icon: '✏️', path: null },
        { name: '删除角色', code: 'system:role:delete', type: 'button', parentId: 3, sort: 3, icon: '🗑️', path: null },
        { name: '分配权限', code: 'system:role:assign', type: 'button', parentId: 3, sort: 4, icon: '🔗', path: null },
        
        // 商品管理
        { name: '商品管理', code: 'product', type: 'menu', parentId: null, sort: 2, icon: '📦', path: '/product' },
        { name: '商品列表', code: 'product:list', type: 'menu', parentId: 12, sort: 1, icon: '📋', path: '/product/list' },
        { name: '新增商品', code: 'product:create', type: 'button', parentId: 13, sort: 1, icon: '➕', path: null },
        { name: '编辑商品', code: 'product:update', type: 'button', parentId: 13, sort: 2, icon: '✏️', path: null },
        { name: '删除商品', code: 'product:delete', type: 'button', parentId: 13, sort: 3, icon: '🗑️', path: null },
        
        // 订单管理
        { name: '订单管理', code: 'order', type: 'menu', parentId: null, sort: 3, icon: '📋', path: '/order' },
        { name: '订单列表', code: 'order:list', type: 'menu', parentId: 17, sort: 1, icon: '📋', path: '/order/list' },
        { name: '订单详情', code: 'order:detail', type: 'button', parentId: 18, sort: 1, icon: '👁️', path: null },
        { name: '更新订单', code: 'order:update', type: 'button', parentId: 18, sort: 2, icon: '✏️', path: null },
      ];

      for (const permission of initialPermissions) {
        await connection.execute(`
          INSERT INTO permissions (name, code, type, parentId, sort, icon, path, description, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          permission.name,
          permission.code,
          permission.type,
          permission.parentId,
          permission.sort,
          permission.icon,
          permission.path,
          `${permission.name}权限`
        ]);
      }
      
      console.log(`✅ 成功插入 ${initialPermissions.length} 条权限数据`);
    }

    // 检查最终表结构
    console.log('\n📋 迁移后的权限表结构:');
    const [finalColumns] = await connection.execute('DESCRIBE permissions');
    finalColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    // 显示权限数据
    const [permissionData] = await connection.execute('SELECT id, name, code, type, parentId, sort FROM permissions ORDER BY sort, id');
    console.log('\n📊 当前权限数据:');
    permissionData.forEach(perm => {
      console.log(`  ${perm.id}. ${perm.name} (${perm.code}) - ${perm.type} - parent: ${perm.parentId || 'null'}`);
    });

    console.log('\n🎉 数据库迁移完成！');

  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
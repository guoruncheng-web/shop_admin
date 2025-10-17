const mysql = require('mysql2/promise');
const fs = require('fs');

async function safeFixBrandsTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: '43.139.80.246',
      port: 3306,
      user: 'root',
      password: 'grc@19980713',
      database: 'wechat_mall'
    });

    console.log('=== 安全修复brands表结构 ===\n');

    // 1. 检查现有表结构
    console.log('1. 检查现有表结构...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'wechat_mall' AND TABLE_NAME = 'brands'
      ORDER BY ORDINAL_POSITION
    `);
    
    console.log('现有字段:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE})`);
    });

    // 2. 检查需要添加的字段
    const requiredFields = [
      { name: 'merchantId', type: 'int', nullable: 'NO', default: '1', comment: '商户id' },
      { name: 'iconUrl', type: 'varchar(255)', nullable: 'NO', default: "''", comment: '品牌icon 必填' },
      { name: 'creator', type: 'varchar(100)', nullable: 'YES', default: 'NULL', comment: '品牌的创建者' },
      { name: 'createTime', type: 'datetime', nullable: 'YES', default: 'NULL', comment: '品牌的创建时间' },
      { name: 'updateTime', type: 'datetime', nullable: 'YES', default: 'NULL', comment: '品牌的更新时间' },
      { name: 'isAuth', type: 'tinyint', nullable: 'YES', default: '0', comment: '0 未认证 1 已认证' },
      { name: 'isHot', type: 'tinyint', nullable: 'YES', default: '0', comment: '0 不是热门 1 热门' },
      { name: 'label', type: 'json', nullable: 'YES', default: 'NULL', comment: '品牌标签数组' }
    ];

    const existingFields = columns.map(col => col.COLUMN_NAME);
    const missingFields = requiredFields.filter(field => !existingFields.includes(field.name));

    if (missingFields.length === 0) {
      console.log('✅ 所有必需字段都已存在');
    } else {
      console.log(`❌ 缺失 ${missingFields.length} 个字段:`);
      missingFields.forEach(field => {
        console.log(`  - ${field.name}: ${field.type}`);
      });

      // 3. 生成ALTER TABLE语句
      console.log('\n3. 生成修复SQL...');
      let alterSql = 'ALTER TABLE brands\n';
      
      missingFields.forEach((field, index) => {
        const nullable = field.nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultValue = field.default === 'NULL' ? 'NULL' : `DEFAULT ${field.default}`;
        alterSql += `  ADD COLUMN ${field.name} ${field.type} ${nullable} ${defaultValue} COMMENT '${field.comment}'`;
        
        if (index < missingFields.length - 1) {
          alterSql += ',\n';
        }
      });

      console.log('生成的SQL:');
      console.log(alterSql);

      // 4. 保存SQL到文件
      fs.writeFileSync('backend/scripts/generated-fix.sql', alterSql + '\n');
      console.log('\n✅ SQL已保存到 backend/scripts/generated-fix.sql');

      // 5. 询问是否执行修复
      console.log('\n⚠️  准备执行数据库修复');
      console.log('请注意：这将修改brands表结构');
      console.log('建议先备份数据库！\n');

      // 这里我们可以选择自动执行或手动执行
      console.log('选项:');
      console.log('1. 执行修复 (自动)');
      console.log('2. 仅生成SQL (手动执行)');
      console.log('3. 取消操作');

      // 为了安全，我们先只生成SQL，让用户手动执行
      console.log('\n📝 建议手动执行以下步骤:');
      console.log('1. 备份数据库');
      console.log('2. 执行 backend/scripts/generated-fix.sql 中的SQL语句');
      console.log('3. 运行 node scripts/check-brands-table.js 验证修复结果');
    }

    // 6. 生成数据迁移SQL
    console.log('\n6. 生成数据迁移SQL...');
    const migrationSql = `
-- 数据迁移SQL
-- 将现有数据迁移到新字段

UPDATE brands SET 
  merchantId = COALESCE(merchantId, 1),
  iconUrl = COALESCE(iconUrl, COALESCE(logo, '')),
  createTime = COALESCE(createTime, created_at),
  updateTime = COALESCE(updateTime, updated_at),
  isAuth = CASE 
    WHEN isAuth IS NULL THEN CASE WHEN status = 1 THEN 1 ELSE 0 END
    ELSE isAuth 
  END,
  isHot = COALESCE(isHot, 0),
  label = COALESCE(label, JSON_ARRAY())
WHERE merchantId IS NULL OR merchantId = 0 OR iconUrl = '';
    `;

    fs.writeFileSync('backend/scripts/migrate-brands-data.sql', migrationSql);
    console.log('✅ 数据迁移SQL已保存到 backend/scripts/migrate-brands-data.sql');

    // 7. 生成最终验证SQL
    console.log('\n7. 生成验证SQL...');
    const verifySql = `
-- 验证表结构
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT,
  COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'wechat_mall' AND TABLE_NAME = 'brands'
ORDER BY ORDINAL_POSITION;

-- 验证数据
SELECT COUNT(*) as total_records,
       COUNT(CASE WHEN merchantId > 0 THEN 1 END) as with_merchantId,
       COUNT(CASE WHEN iconUrl != '' THEN 1 END) as with_iconUrl,
       COUNT(CASE WHEN isAuth = 1 THEN 1 END) as authenticated
FROM brands;
    `;

    fs.writeFileSync('backend/scripts/verify-brands-fix.sql', verifySql);
    console.log('✅ 验证SQL已保存到 backend/scripts/verify-brands-fix.sql');

    console.log('\n🎯 修复准备完成！');
    console.log('\n📋 生成的文件:');
    console.log('  - backend/scripts/generated-fix.sql (表结构修复)');
    console.log('  - backend/scripts/migrate-brands-data.sql (数据迁移)');
    console.log('  - backend/scripts/verify-brands-fix.sql (验证脚本)');
    
    console.log('\n🔧 执行步骤:');
    console.log('1. 备份数据库');
    console.log('2. mysql -h 43.139.80.246 -u root -p wechat_mall < backend/scripts/generated-fix.sql');
    console.log('3. mysql -h 43.139.80.246 -u root -p wechat_mall < backend/scripts/migrate-brands-data.sql');
    console.log('4. node scripts/check-brands-table.js (验证结果)');

  } catch (error) {
    console.error('❌ 修复过程中出错:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

// 运行修复
safeFixBrandsTable();
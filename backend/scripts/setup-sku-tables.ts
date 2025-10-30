import * as mysql from 'mysql2/promise';

// 加载环境变量
require('dotenv').config({ path: '.env.development' });

/**
 * 搭建SKU数据库表
 */
async function setupSkuTables() {
  let connection: mysql.Connection | null = null;

  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      multipleStatements: true,
    });

    console.log('✅ 数据库连接成功\n');

    // 1. 检查并创建 categories 表（如果不存在）
    console.log('📋 步骤 1: 检查商品分类表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`categories\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
        \`merchant_id\` BIGINT NOT NULL COMMENT '商户ID',
        \`parent_id\` BIGINT DEFAULT 0 COMMENT '父分类ID',
        \`category_name\` VARCHAR(100) NOT NULL COMMENT '分类名称',
        \`category_code\` VARCHAR(50) NULL COMMENT '分类编码',
        \`icon\` VARCHAR(500) NULL COMMENT '分类图标',
        \`image\` VARCHAR(500) NULL COMMENT '分类图片',
        \`description\` TEXT NULL COMMENT '分类描述',
        \`level\` TINYINT DEFAULT 1 COMMENT '分类层级',
        \`path_ids\` VARCHAR(500) NULL COMMENT '路径ID（逗号分隔）',
        \`sort\` INT DEFAULT 0 COMMENT '排序',
        \`status\` TINYINT DEFAULT 1 COMMENT '状态 (0-禁用 1-启用)',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX \`idx_merchant\` (\`merchant_id\`),
        INDEX \`idx_parent\` (\`parent_id\`),
        INDEX \`idx_level\` (\`level\`),
        INDEX \`idx_sort\` (\`sort\`),
        INDEX \`idx_status\` (\`status\`),
        FOREIGN KEY (\`merchant_id\`) REFERENCES \`merchants\`(\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表'
    `);
    console.log('✅ 商品分类表检查完成\n');

    // 2. 检查 products 表是否需要添加字段
    console.log('📋 步骤 2: 检查商品表字段...');
    const [columns] = (await connection.execute(
      "SHOW COLUMNS FROM products WHERE Field IN ('merchant_id', 'product_no', 'original_price', 'sales', 'virtual_sales', 'unit', 'has_sku', 'sort', 'created_by', 'updated_by')",
    )) as [any[], any];

    const existingColumns = new Set(
      columns.map((col: any) => col.Field),
    );

    // 添加缺失的字段
    if (!existingColumns.has('merchant_id')) {
      // 先添加字段，默认值为1（平台超级商户）
      await connection.execute(
        'ALTER TABLE products ADD COLUMN merchant_id BIGINT NOT NULL DEFAULT 1 COMMENT "商户ID" AFTER id',
      );
      await connection.execute(
        'ALTER TABLE products ADD INDEX idx_merchant (merchant_id)',
      );
      await connection.execute(
        'ALTER TABLE products ADD FOREIGN KEY (merchant_id) REFERENCES merchants(id)',
      );
      console.log('  ✓ 添加 merchant_id 字段（默认值为1）');
    }

    if (!existingColumns.has('product_no')) {
      // 先添加可为空的字段
      await connection.execute(
        'ALTER TABLE products ADD COLUMN product_no VARCHAR(100) NULL COMMENT "商品编号" AFTER brand_id',
      );
      // 为现有记录生成编号
      await connection.execute(
        'UPDATE products SET product_no = CONCAT("PROD-", LPAD(id, 8, "0")) WHERE product_no IS NULL',
      );
      // 然后添加唯一约束
      await connection.execute(
        'ALTER TABLE products MODIFY COLUMN product_no VARCHAR(100) NOT NULL',
      );
      await connection.execute(
        'ALTER TABLE products ADD UNIQUE KEY uniq_product_no (product_no)',
      );
      console.log('  ✓ 添加 product_no 字段并生成编号');
    }

    if (!existingColumns.has('original_price')) {
      await connection.execute(
        'ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2) DEFAULT 0.00 COMMENT "原价" AFTER description',
      );
      console.log('  ✓ 添加 original_price 字段');
    }

    if (!existingColumns.has('sales')) {
      await connection.execute(
        'ALTER TABLE products ADD COLUMN sales INT DEFAULT 0 COMMENT "销量" AFTER stock',
      );
      console.log('  ✓ 添加 sales 字段');
    }

    if (!existingColumns.has('virtual_sales')) {
      await connection.execute(
        'ALTER TABLE products ADD COLUMN virtual_sales INT DEFAULT 0 COMMENT "虚拟销量" AFTER sales',
      );
      console.log('  ✓ 添加 virtual_sales 字段');
    }

    if (!existingColumns.has('unit')) {
      await connection.execute(
        'ALTER TABLE products ADD COLUMN unit VARCHAR(20) DEFAULT "件" COMMENT "单位" AFTER weight',
      );
      console.log('  ✓ 添加 unit 字段');
    }

    if (!existingColumns.has('has_sku')) {
      await connection.execute(
        'ALTER TABLE products ADD COLUMN has_sku TINYINT DEFAULT 0 COMMENT "是否有SKU (0-否 1-是)" AFTER unit',
      );
      console.log('  ✓ 添加 has_sku 字段');
    }

    if (!existingColumns.has('sort')) {
      await connection.execute(
        'ALTER TABLE products ADD COLUMN sort INT DEFAULT 0 COMMENT "排序" AFTER is_recommend',
      );
      await connection.execute(
        'ALTER TABLE products ADD INDEX idx_sort (sort)',
      );
      console.log('  ✓ 添加 sort 字段');
    }

    if (!existingColumns.has('created_by')) {
      await connection.execute(
        'ALTER TABLE products ADD COLUMN created_by BIGINT NULL COMMENT "创建人ID" AFTER updated_at',
      );
      console.log('  ✓ 添加 created_by 字段');
    }

    if (!existingColumns.has('updated_by')) {
      await connection.execute(
        'ALTER TABLE products ADD COLUMN updated_by BIGINT NULL COMMENT "更新人ID" AFTER created_by',
      );
      console.log('  ✓ 添加 updated_by 字段');
    }

    console.log('✅ 商品表字段检查完成\n');

    // 3. 创建 SKU规格名称表
    console.log('📋 步骤 3: 创建SKU规格名称表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`sku_spec_names\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '规格名称ID',
        \`merchant_id\` BIGINT NOT NULL COMMENT '商户ID',
        \`product_id\` BIGINT NOT NULL COMMENT '商品ID',
        \`spec_name\` VARCHAR(50) NOT NULL COMMENT '规格名称（如：颜色、尺寸、材质）',
        \`spec_level\` TINYINT NOT NULL COMMENT '规格级别 (1-一级 2-二级 3-三级)',
        \`parent_id\` BIGINT NULL COMMENT '父规格ID（二级和三级需要关联父规格）',
        \`sort\` INT DEFAULT 0 COMMENT '排序',
        \`is_required\` TINYINT DEFAULT 1 COMMENT '是否必选 (0-否 1-是)',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX \`idx_merchant_product\` (\`merchant_id\`, \`product_id\`),
        INDEX \`idx_product\` (\`product_id\`),
        INDEX \`idx_level\` (\`spec_level\`),
        INDEX \`idx_parent\` (\`parent_id\`),
        INDEX \`idx_sort\` (\`sort\`),
        UNIQUE KEY \`uniq_product_name_level\` (\`product_id\`, \`spec_name\`, \`spec_level\`),
        FOREIGN KEY (\`merchant_id\`) REFERENCES \`merchants\`(\`id\`),
        FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SKU规格名称表'
    `);
    console.log('✅ SKU规格名称表创建完成\n');

    // 4. 创建 SKU规格值表
    console.log('📋 步骤 4: 创建SKU规格值表...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`sku_spec_values\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '规格值ID',
        \`merchant_id\` BIGINT NOT NULL COMMENT '商户ID',
        \`product_id\` BIGINT NOT NULL COMMENT '商品ID',
        \`spec_name_id\` BIGINT NOT NULL COMMENT '规格名称ID',
        \`spec_value\` VARCHAR(100) NOT NULL COMMENT '规格值（如：红色、XL、纯棉）',
        \`image\` VARCHAR(500) NULL COMMENT '规格图片（如颜色可以有图片）',
        \`color_hex\` VARCHAR(20) NULL COMMENT '颜色值（#FF0000）',
        \`extra_price\` DECIMAL(10,2) DEFAULT 0.00 COMMENT '额外加价',
        \`sort\` INT DEFAULT 0 COMMENT '排序',
        \`is_default\` TINYINT DEFAULT 0 COMMENT '是否默认 (0-否 1-是)',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX \`idx_merchant_product\` (\`merchant_id\`, \`product_id\`),
        INDEX \`idx_spec_name\` (\`spec_name_id\`),
        INDEX \`idx_product\` (\`product_id\`),
        INDEX \`idx_sort\` (\`sort\`),
        UNIQUE KEY \`uniq_spec_name_value\` (\`spec_name_id\`, \`spec_value\`),
        FOREIGN KEY (\`merchant_id\`) REFERENCES \`merchants\`(\`id\`),
        FOREIGN KEY (\`spec_name_id\`) REFERENCES \`sku_spec_names\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SKU规格值表'
    `);
    console.log('✅ SKU规格值表创建完成\n');

    // 5. 删除并重新创建 product_skus 表
    console.log('📋 步骤 5: 重新创建商品SKU表...');
    await connection.execute('DROP TABLE IF EXISTS `product_skus`');
    await connection.execute(`
      CREATE TABLE \`product_skus\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'SKU ID',
        \`merchant_id\` BIGINT NOT NULL COMMENT '商户ID',
        \`product_id\` BIGINT NOT NULL COMMENT '商品ID',
        \`sku_no\` VARCHAR(100) UNIQUE NOT NULL COMMENT 'SKU编号',
        \`sku_name\` VARCHAR(200) NULL COMMENT 'SKU名称',
        \`spec_value_id_1\` BIGINT NULL COMMENT '一级规格值ID',
        \`spec_value_id_2\` BIGINT NULL COMMENT '二级规格值ID',
        \`spec_value_id_3\` BIGINT NULL COMMENT '三级规格值ID',
        \`spec_text\` VARCHAR(500) NULL COMMENT 'SKU规格文本（如：红色-XL-纯棉）',
        \`spec_json\` JSON NULL COMMENT '规格JSON {"颜色":"红色","尺寸":"XL"}',
        \`image\` VARCHAR(500) NULL COMMENT 'SKU主图',
        \`images\` JSON NULL COMMENT 'SKU图片列表',
        \`original_price\` DECIMAL(10,2) DEFAULT 0.00 COMMENT '原价',
        \`price\` DECIMAL(10,2) NOT NULL COMMENT '售价',
        \`cost_price\` DECIMAL(10,2) DEFAULT 0.00 COMMENT '成本价',
        \`stock\` INT DEFAULT 0 COMMENT '库存',
        \`warning_stock\` INT DEFAULT 10 COMMENT '预警库存',
        \`sales\` INT DEFAULT 0 COMMENT '销量',
        \`lock_stock\` INT DEFAULT 0 COMMENT '锁定库存（订单未支付）',
        \`weight\` DECIMAL(10,2) DEFAULT 0.00 COMMENT '重量(kg)',
        \`volume\` DECIMAL(10,2) DEFAULT 0.00 COMMENT '体积(m³)',
        \`barcode\` VARCHAR(100) NULL COMMENT '条形码',
        \`qr_code\` VARCHAR(500) NULL COMMENT '二维码URL',
        \`status\` TINYINT DEFAULT 1 COMMENT '状态 (0-禁用 1-启用)',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        \`deleted_at\` TIMESTAMP NULL COMMENT '软删除时间',
        INDEX \`idx_merchant_product\` (\`merchant_id\`, \`product_id\`),
        INDEX \`idx_merchant\` (\`merchant_id\`),
        INDEX \`idx_product\` (\`product_id\`),
        INDEX \`idx_spec_1\` (\`spec_value_id_1\`),
        INDEX \`idx_spec_2\` (\`spec_value_id_2\`),
        INDEX \`idx_spec_3\` (\`spec_value_id_3\`),
        INDEX \`idx_status\` (\`status\`),
        INDEX \`idx_stock\` (\`stock\`),
        INDEX \`idx_barcode\` (\`barcode\`),
        UNIQUE KEY \`uniq_product_specs\` (\`product_id\`, \`spec_value_id_1\`, \`spec_value_id_2\`, \`spec_value_id_3\`),
        FOREIGN KEY (\`merchant_id\`) REFERENCES \`merchants\`(\`id\`),
        FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`spec_value_id_1\`) REFERENCES \`sku_spec_values\`(\`id\`),
        FOREIGN KEY (\`spec_value_id_2\`) REFERENCES \`sku_spec_values\`(\`id\`),
        FOREIGN KEY (\`spec_value_id_3\`) REFERENCES \`sku_spec_values\`(\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品SKU表'
    `);
    console.log('✅ 商品SKU表创建完成\n');

    // 6. 验证所有表都已创建
    console.log('📋 步骤 6: 验证表结构...');
    const [tables] = (await connection.execute(`
      SELECT TABLE_NAME
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = '${process.env.DATABASE_NAME}'
      AND TABLE_NAME IN ('products', 'categories', 'sku_spec_names', 'sku_spec_values', 'product_skus')
      ORDER BY TABLE_NAME
    `)) as [any[], any];

    console.log('✅ 已创建的表:');
    tables.forEach((table: any) => {
      console.log(`   ✓ ${table.TABLE_NAME}`);
    });

    console.log('\n✨ SKU数据库表搭建完成！');
    console.log('\n📊 表结构总结:');
    console.log('   1. products - 商品表（已更新字段）');
    console.log('   2. categories - 商品分类表');
    console.log('   3. sku_spec_names - SKU规格名称表（三级规格）');
    console.log('   4. sku_spec_values - SKU规格值表');
    console.log('   5. product_skus - 商品SKU表（完整版）');
  } catch (error) {
    console.error(
      '\n❌ 操作失败:',
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
  console.log('========================================');
  console.log('   SKU数据库表搭建脚本');
  console.log('========================================\n');

  await setupSkuTables();
}

// 执行脚本
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n脚本执行失败:', error);
    process.exit(1);
  });

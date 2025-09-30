import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CreateRoleMenusTableMigration {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async up(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      // 检查表是否存在
      const tableExists = await queryRunner.hasTable('role_menus');

      if (!tableExists) {
        console.log('创建 role_menus 表...');

        await queryRunner.query(`
          CREATE TABLE \`role_menus\` (
            \`id\` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
            \`role_id\` bigint NOT NULL COMMENT '角色ID',
            \`menu_id\` bigint NOT NULL COMMENT '菜单ID',
            \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
            \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`uk_role_menu\` (\`role_id\`,\`menu_id\`),
            KEY \`idx_role_id\` (\`role_id\`),
            KEY \`idx_menu_id\` (\`menu_id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色菜单关联表'
        `);

        // 添加外键约束（如果相关表存在）
        const rolesTableExists = await queryRunner.hasTable('roles');
        const menusTableExists = await queryRunner.hasTable('menus');

        if (rolesTableExists) {
          await queryRunner.query(`
            ALTER TABLE \`role_menus\` 
            ADD CONSTRAINT \`fk_role_menus_role_id\` 
            FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON DELETE CASCADE
          `);
        }

        if (menusTableExists) {
          await queryRunner.query(`
            ALTER TABLE \`role_menus\` 
            ADD CONSTRAINT \`fk_role_menus_menu_id\` 
            FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\` (\`id\`) ON DELETE CASCADE
          `);
        }

        console.log('role_menus 表创建成功');
      } else {
        console.log('role_menus 表已存在');
      }
    } catch (error) {
      console.error('创建 role_menus 表失败:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async down(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      const tableExists = await queryRunner.hasTable('role_menus');

      if (tableExists) {
        console.log('删除 role_menus 表...');
        await queryRunner.query('DROP TABLE `role_menus`');
        console.log('role_menus 表删除成功');
      }
    } catch (error) {
      console.error('删除 role_menus 表失败:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async checkTableStatus(): Promise<{
    exists: boolean;
    columns?: string[];
    indexes?: string[];
  }> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      const tableExists = await queryRunner.hasTable('role_menus');

      if (!tableExists) {
        return { exists: false };
      }

      // 获取表结构信息
      const columns = await queryRunner.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'role_menus'
        ORDER BY ORDINAL_POSITION
      `);

      const indexes = await queryRunner.query(`
        SELECT INDEX_NAME, COLUMN_NAME 
        FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'role_menus'
        ORDER BY INDEX_NAME, SEQ_IN_INDEX
      `);

      return {
        exists: true,
        columns: columns.map((col: any) => col.COLUMN_NAME),
        indexes: indexes.map(
          (idx: any) => `${idx.INDEX_NAME}(${idx.COLUMN_NAME})`,
        ),
      };
    } catch (error) {
      console.error('检查表状态失败:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

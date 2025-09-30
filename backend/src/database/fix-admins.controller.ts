import { Controller, Post } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { Public } from '../auth/decorators/public.decorator';

@Controller('fix-admins')
export class FixAdminsController {
  constructor(
    @InjectConnection()
    private connection: Connection,
  ) {}

  @Public()
  @Post('fix-table-structure')
  async fixTableStructure() {
    try {
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();

      try {
        let roleIdColumnRemoved = false;
        let adminRolesTableCreated = false;

        // 检查 admins 表是否存在 role_id 字段
        const tableExists = await queryRunner.hasTable('admins');
        if (tableExists) {
          const table = await queryRunner.getTable('admins');
          const roleIdColumn = table?.findColumnByName('role_id');

          if (roleIdColumn) {
            console.log('发现 role_id 字段，正在删除...');

            // 首先删除相关的外键约束
            try {
              const foreignKeys = table.foreignKeys.filter((fk) =>
                fk.columnNames.includes('role_id'),
              );

              for (const foreignKey of foreignKeys) {
                console.log(`删除外键约束: ${foreignKey.name}`);
                await queryRunner.dropForeignKey('admins', foreignKey);
              }

              // 删除相关的索引
              const indices = table.indices.filter((index) =>
                index.columnNames.includes('role_id'),
              );

              for (const index of indices) {
                console.log(`删除索引: ${index.name}`);
                await queryRunner.dropIndex('admins', index);
              }
            } catch (constraintError) {
              console.log(
                '删除约束时出错，尝试直接删除字段:',
                constraintError.message,
              );
            }

            // 最后删除 role_id 字段
            await queryRunner.dropColumn('admins', 'role_id');
            console.log('✅ 已删除 admins 表中的 role_id 字段');
            roleIdColumnRemoved = true;
          } else {
            console.log('✅ admins 表中没有 role_id 字段，无需删除');
          }
        }

        // 确保 admin_roles 中间表存在
        const adminRolesExists = await queryRunner.hasTable('admin_roles');
        if (!adminRolesExists) {
          console.log('创建 admin_roles 中间表...');
          await queryRunner.query(`
            CREATE TABLE admin_roles (
              admin_id bigint NOT NULL,
              role_id bigint NOT NULL,
              PRIMARY KEY (admin_id, role_id),
              UNIQUE KEY uk_admin_role (admin_id, role_id),
              KEY idx_admin_roles_admin_id (admin_id),
              KEY idx_admin_roles_role_id (role_id),
              CONSTRAINT fk_admin_roles_admin_id FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE,
              CONSTRAINT fk_admin_roles_role_id FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员角色关联表';
          `);
          console.log('✅ 已创建 admin_roles 中间表');
          adminRolesTableCreated = true;
        } else {
          console.log('✅ admin_roles 中间表已存在');
        }

        return {
          code: 200,
          message: '数据库表结构修复完成',
          data: {
            roleIdColumnRemoved,
            adminRolesTableCreated,
          },
        };
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error('修复数据库表结构失败:', error);
      return {
        code: 500,
        message: '修复数据库表结构失败',
        error: error.message,
      };
    }
  }

  @Public()
  @Post('check-table-structure')
  async checkTableStructure() {
    try {
      const queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();

      try {
        // 检查 admins 表结构
        const adminsTable = await queryRunner.getTable('admins');
        const adminsColumns =
          adminsTable?.columns.map((col) => ({
            name: col.name,
            type: col.type,
            isNullable: col.isNullable,
            isPrimary: col.isPrimary,
          })) || [];

        // 检查 admin_roles 表是否存在
        const adminRolesExists = await queryRunner.hasTable('admin_roles');
        let adminRolesColumns = [];

        if (adminRolesExists) {
          const adminRolesTable = await queryRunner.getTable('admin_roles');
          adminRolesColumns =
            adminRolesTable?.columns.map((col) => ({
              name: col.name,
              type: col.type,
              isNullable: col.isNullable,
              isPrimary: col.isPrimary,
            })) || [];
        }

        return {
          code: 200,
          message: '表结构检查完成',
          data: {
            admins: {
              exists: !!adminsTable,
              columns: adminsColumns,
              hasRoleIdColumn: adminsColumns.some(
                (col) => col.name === 'role_id',
              ),
            },
            adminRoles: {
              exists: adminRolesExists,
              columns: adminRolesColumns,
            },
          },
        };
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error('检查表结构失败:', error);
      return {
        code: 500,
        message: '检查表结构失败',
        error: error.message,
      };
    }
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMenuButtons1726815600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 为角色管理添加按钮权限
    await queryRunner.query(`
      INSERT INTO menus (name, path, component, icon, type, parentId, level, sort, status, createdAt, updatedAt) VALUES
      ('查看', '', '', '👁️', 3, 3, 3, 1, 1, NOW(), NOW()),
      ('新增', '', '', '➕', 3, 3, 3, 2, 1, NOW(), NOW()),
      ('编辑', '', '', '✏️', 3, 3, 3, 3, 1, NOW(), NOW()),
      ('删除', '', '', '🗑️', 3, 3, 3, 4, 1, NOW(), NOW())
    `);

    // 为菜单管理添加按钮权限
    await queryRunner.query(`
      INSERT INTO menus (name, path, component, icon, type, parentId, level, sort, status, createdAt, updatedAt) VALUES
      ('查看', '', '', '👁️', 3, 4, 3, 1, 1, NOW(), NOW()),
      ('新增', '', '', '➕', 3, 4, 3, 2, 1, NOW(), NOW()),
      ('编辑', '', '', '✏️', 3, 4, 3, 3, 1, NOW(), NOW()),
      ('删除', '', '', '🗑️', 3, 4, 3, 4, 1, NOW(), NOW())
    `);

    // 为分类管理添加按钮权限
    await queryRunner.query(`
      INSERT INTO menus (name, path, component, icon, type, parentId, level, sort, status, createdAt, updatedAt) VALUES
      ('查看', '', '', '👁️', 3, 7, 3, 1, 1, NOW(), NOW()),
      ('新增', '', '', '➕', 3, 7, 3, 2, 1, NOW(), NOW()),
      ('编辑', '', '', '✏️', 3, 7, 3, 3, 1, NOW(), NOW()),
      ('删除', '', '', '🗑️', 3, 7, 3, 4, 1, NOW(), NOW())
    `);

    // 为用户管理添加查看按钮权限（已有新增、编辑、删除）
    await queryRunner.query(`
      INSERT INTO menus (name, path, component, icon, type, parentId, level, sort, status, createdAt, updatedAt) VALUES
      ('查看', '', '', '👁️', 3, 2, 3, 0, 1, NOW(), NOW())
    `);

    // 为权限管理添加其他按钮权限（已有新增）
    await queryRunner.query(`
      INSERT INTO menus (name, path, component, icon, type, parentId, level, sort, status, createdAt, updatedAt) VALUES
      ('查看', '', '', '👁️', 3, 22, 3, 0, 1, NOW(), NOW()),
      ('编辑', '', '', '✏️', 3, 22, 3, 2, 1, NOW(), NOW()),
      ('删除', '', '', '🗑️', 3, 22, 3, 3, 1, NOW(), NOW())
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除添加的按钮权限
    await queryRunner.query(`
      DELETE FROM menus WHERE type = 3 AND parentId IN (3, 4, 7) AND name IN ('查看', '新增', '编辑', '删除')
    `);

    // 删除为用户管理和权限管理补充的按钮
    await queryRunner.query(`
      DELETE FROM menus WHERE type = 3 AND parentId = 2 AND name = '查看'
    `);

    await queryRunner.query(`
      DELETE FROM menus WHERE type = 3 AND parentId = 22 AND name IN ('查看', '编辑', '删除')
    `);
  }
}

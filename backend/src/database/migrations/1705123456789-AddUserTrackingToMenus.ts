import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserTrackingToMenus1705123456789 implements MigrationInterface {
  name = 'AddUserTrackingToMenus1705123456789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE menus 
      ADD COLUMN created_by BIGINT NULL COMMENT '创建者用户ID',
      ADD COLUMN updated_by BIGINT NULL COMMENT '更新者用户ID',
      ADD COLUMN created_by_name VARCHAR(100) NULL COMMENT '创建者姓名',
      ADD COLUMN updated_by_name VARCHAR(100) NULL COMMENT '更新者姓名'
    `);

    await queryRunner.query(`
      CREATE INDEX idx_menus_created_by ON menus(created_by)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_menus_updated_by ON menus(updated_by)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_menus_updated_by ON menus`);
    await queryRunner.query(`DROP INDEX idx_menus_created_by ON menus`);
    await queryRunner.query(`
      ALTER TABLE menus 
      DROP COLUMN updated_by_name,
      DROP COLUMN created_by_name,
      DROP COLUMN updated_by,
      DROP COLUMN created_by
    `);
  }
}
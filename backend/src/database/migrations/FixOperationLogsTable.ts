import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixOperationLogsTable1234567890 implements MigrationInterface {
  name = 'FixOperationLogsTable1234567890';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE operation_logs 
      MODIFY COLUMN statusCode INT NOT NULL DEFAULT 200 COMMENT '响应状态码'
    `);
    
    await queryRunner.query(`
      ALTER TABLE operation_logs 
      MODIFY COLUMN executionTime INT NOT NULL DEFAULT 0 COMMENT '执行时间(ms)'
    `);
    
    await queryRunner.query(`
      ALTER TABLE operation_logs 
      MODIFY COLUMN status ENUM('success', 'failed') NOT NULL DEFAULT 'success' COMMENT '操作状态'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 回滚操作
    await queryRunner.query(`
      ALTER TABLE operation_logs 
      MODIFY COLUMN statusCode INT NOT NULL COMMENT '响应状态码'
    `);
    
    await queryRunner.query(`
      ALTER TABLE operation_logs 
      MODIFY COLUMN executionTime INT NOT NULL COMMENT '执行时间(ms)'
    `);
    
    await queryRunner.query(`
      ALTER TABLE operation_logs 
      MODIFY COLUMN status ENUM('success', 'failed') NOT NULL COMMENT '操作状态'
    `);
  }
}
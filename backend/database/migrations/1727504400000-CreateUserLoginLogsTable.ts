import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUserLoginLogsTable1727504400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_login_logs',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            comment: '日志ID',
          },
          {
            name: 'userId',
            type: 'bigint',
            comment: '用户ID',
          },
          {
            name: 'ip',
            type: 'varchar',
            length: '45',
            comment: 'IP地址',
          },
          {
            name: 'userAgent',
            type: 'varchar',
            length: '500',
            isNullable: true,
            comment: '用户代理',
          },
          {
            name: 'location',
            type: 'varchar',
            length: '100',
            isNullable: true,
            comment: '登录地点',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['success', 'failed'],
            default: "'success'",
            comment: '登录状态',
          },
          {
            name: 'failReason',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: '失败原因',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            comment: '创建时间',
          },
        ],
        indices: [
          {
            name: 'IDX_USER_LOGIN_LOGS_USER_ID',
            columnNames: ['userId'],
          },
          {
            name: 'IDX_USER_LOGIN_LOGS_STATUS',
            columnNames: ['status'],
          },
          {
            name: 'IDX_USER_LOGIN_LOGS_CREATED_AT',
            columnNames: ['createdAt'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_login_logs');
  }
}
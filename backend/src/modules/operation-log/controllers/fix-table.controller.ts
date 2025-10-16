import { Controller, Post, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('操作日志表结构修复')
@Controller('api/operation-logs')
export class FixTableController {
  constructor(private readonly dataSource: DataSource) {}

  @Post('fix-table')
  @ApiOperation({
    summary: '修复操作日志表结构',
    description: '修复操作日志表的结构，确保字段类型和默认值正确',
  })
  @ApiResponse({
    status: 200,
    description: '修复成功',
  })
  @ApiResponse({
    status: 500,
    description: '修复失败',
  })
  async fixTable(): Promise<{
    code: number;
    data: unknown;
    msg: string;
  }> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // 修改 statusCode 字段
        await queryRunner.query(`
          ALTER TABLE operation_logs 
          MODIFY COLUMN statusCode INT NOT NULL DEFAULT 200 COMMENT '响应状态码'
        `);

        // 修改 executionTime 字段
        await queryRunner.query(`
          ALTER TABLE operation_logs 
          MODIFY COLUMN executionTime INT NOT NULL DEFAULT 0 COMMENT '执行时间(ms)'
        `);

        // 修改 status 字段
        await queryRunner.query(`
          ALTER TABLE operation_logs 
          MODIFY COLUMN status ENUM('success', 'failed') NOT NULL DEFAULT 'success' COMMENT '操作状态'
        `);

        await queryRunner.commitTransaction();

        return {
          code: 200,
          data: null,
          msg: '操作日志表结构修复成功',
        };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      console.error('修复操作日志表结构失败:', error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        code: 500,
        data: null,
        msg: `修复失败: ${errorMessage}`,
      };
    }
  }

  @Get('check-table')
  @ApiOperation({
    summary: '检查操作日志表结构',
    description: '获取操作日志表的当前结构信息',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
  })
  @ApiResponse({
    status: 500,
    description: '获取失败',
  })
  async checkTable(): Promise<{
    code: number;
    data: unknown;
    msg: string;
  }> {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // 定义表结构信息的接口
      interface TableInfo {
        Field: string;
        Type: string;
        Null: string;
        Key: string;
        Default: string | null;
        Extra: string;
      }

      // 使用类型断言来确保返回值类型安全
      const tableInfo = (await queryRunner.query(`
        DESCRIBE operation_logs
      `)) as TableInfo[];

      await queryRunner.release();

      return {
        code: 200,
        data: tableInfo,
        msg: '获取表结构成功',
      };
    } catch (error) {
      console.error('获取操作日志表结构失败:', error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        code: 500,
        data: null,
        msg: `获取失败: ${errorMessage}`,
      };
    }
  }
}

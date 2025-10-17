import { Controller, Get, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('数据库迁移')
@Public()
@Controller('database/migrate')
export class InitLogMerchantController {
  constructor(private dataSource: DataSource) {}

  @Post('init-log-merchant')
  @ApiOperation({ summary: '初始化日志表的商户ID数据' })
  @ApiResponse({ status: 200, description: '迁移成功' })
  async initLogMerchantData() {
    try {
      console.log('🔄 开始初始化日志表的商户ID数据...');

      // 1. 首先为登录日志表添加商户ID字段（如果不存在）
      try {
        console.log('🔍 检查登录日志表结构...');
        const loginTableStructure = await this.dataSource.query(
          'DESCRIBE user_login_logs',
        );
        console.log(
          '登录日志表当前结构:',
          loginTableStructure.map((col) => col.Field),
        );

        await this.dataSource.query(`
          ALTER TABLE user_login_logs
          ADD COLUMN merchant_id BIGINT NULL COMMENT '所属商户ID'
        `);
        console.log('✅ 登录日志表添加merchant_id字段成功');

        // 添加索引
        await this.dataSource.query(`
          CREATE INDEX idx_user_login_logs_merchant_id ON user_login_logs(merchant_id)
        `);
        console.log('✅ 登录日志表添加merchant_id索引成功');
      } catch (error) {
        console.error('登录日志表添加字段错误:', error.message);
        if (
          error.message.includes("Duplicate column name 'merchant_id'") ||
          error.message.includes('1060') ||
          error.message.includes('column already exists')
        ) {
          console.log('ℹ️ 登录日志表merchant_id字段已存在');
        } else {
          throw error;
        }
      }

      // 2. 为操作日志表添加商户ID字段（如果不存在）
      try {
        console.log('🔍 检查操作日志表结构...');
        const operationTableStructure = await this.dataSource.query(
          'DESCRIBE operation_logs',
        );
        console.log(
          '操作日志表当前结构:',
          operationTableStructure.map((col) => col.Field),
        );

        await this.dataSource.query(`
          ALTER TABLE operation_logs
          ADD COLUMN merchant_id BIGINT NULL COMMENT '所属商户ID'
        `);
        console.log('✅ 操作日志表添加merchant_id字段成功');

        // 添加索引
        await this.dataSource.query(`
          CREATE INDEX idx_operation_logs_merchant_id ON operation_logs(merchant_id)
        `);
        console.log('✅ 操作日志表添加merchant_id索引成功');
      } catch (error) {
        console.error('操作日志表添加字段错误:', error.message);
        if (
          error.message.includes("Duplicate column name 'merchant_id'") ||
          error.message.includes('1060') ||
          error.message.includes('column already exists')
        ) {
          console.log('ℹ️ 操作日志表merchant_id字段已存在');
        } else {
          throw error;
        }
      }

      // 3. 初始化登录日志表的商户ID
      const updateLoginLogs = await this.dataSource.query(`
        UPDATE user_login_logs
        SET merchant_id = 1
        WHERE merchant_id IS NULL
      `);

      console.log(
        '✅ 登录日志商户ID初始化完成，影响行数:',
        updateLoginLogs.affectedRows,
      );

      // 4. 初始化操作日志表的商户ID
      const updateOperationLogs = await this.dataSource.query(`
        UPDATE operation_logs
        SET merchant_id = 1
        WHERE merchant_id IS NULL
      `);

      console.log(
        '✅ 操作日志商户ID初始化完成，影响行数:',
        updateOperationLogs.affectedRows,
      );

      // 验证结果
      const [loginLogs] = await this.dataSource.query(`
        SELECT 
          COUNT(*) as total, 
          COUNT(merchant_id) as with_merchant,
          COUNT(*) - COUNT(merchant_id) as without_merchant
        FROM user_login_logs
      `);

      const [operationLogs] = await this.dataSource.query(`
        SELECT 
          COUNT(*) as total, 
          COUNT(merchant_id) as with_merchant,
          COUNT(*) - COUNT(merchant_id) as without_merchant
        FROM operation_logs
      `);

      console.log('📊 登录日志统计:', loginLogs[0]);
      console.log('📊 操作日志统计:', operationLogs[0]);

      return {
        success: true,
        message: '日志商户数据初始化完成',
        data: {
          loginLogs: loginLogs[0],
          operationLogs: operationLogs[0],
        },
      };
    } catch (error) {
      console.error('❌ 迁移失败:', error.message);
      return {
        success: false,
        message: '迁移失败',
        error: error.message,
      };
    }
  }

  @Get('check-log-merchant')
  @ApiOperation({ summary: '检查日志表的商户ID状态' })
  @ApiResponse({ status: 200, description: '检查成功' })
  async checkLogMerchantStatus() {
    try {
      // 检查登录日志表
      const [loginLogs] = await this.dataSource.query(`
        SELECT 
          COUNT(*) as total, 
          COUNT(merchant_id) as with_merchant,
          COUNT(*) - COUNT(merchant_id) as without_merchant
        FROM user_login_logs
      `);

      // 检查操作日志表
      const [operationLogs] = await this.dataSource.query(`
        SELECT 
          COUNT(*) as total, 
          COUNT(merchant_id) as with_merchant,
          COUNT(*) - COUNT(merchant_id) as without_merchant
        FROM operation_logs
      `);

      // 检查表结构
      const [loginLogColumns] = await this.dataSource.query(`
        SHOW COLUMNS FROM user_login_logs LIKE 'merchant_id'
      `);

      const [operationLogColumns] = await this.dataSource.query(`
        SHOW COLUMNS FROM operation_logs LIKE 'merchant_id'
      `);

      return {
        success: true,
        message: '检查完成',
        data: {
          loginLogs: {
            ...loginLogs[0],
            hasColumn: loginLogColumns.length > 0,
          },
          operationLogs: {
            ...operationLogs[0],
            hasColumn: operationLogColumns.length > 0,
          },
        },
      };
    } catch (error) {
      console.error('❌ 检查失败:', error.message);
      return {
        success: false,
        message: '检查失败',
        error: error.message,
      };
    }
  }
}

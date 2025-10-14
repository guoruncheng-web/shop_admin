import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Public } from '../auth/decorators/public.decorator';

@Controller('database/migrate')
export class AddMerchantToUsersController {
  constructor(private dataSource: DataSource) {}

  @Post('add-merchant-to-users')
  @Public()
  @HttpCode(HttpStatus.OK)
  async addMerchantToUsers() {
    try {
      console.log('🔄 开始为用户表添加商户ID字段...');
      
      // 1. 为admins表添加merchant_id字段（如果不存在）
      try {
        await this.dataSource.query(`
          ALTER TABLE admins 
          ADD COLUMN merchant_id BIGINT DEFAULT 1 COMMENT '所属商户ID'
        `);
        console.log('✅ admins表添加merchant_id字段成功');
        
        // 添加索引
        await this.dataSource.query(`
          CREATE INDEX idx_admins_merchant_id ON admins(merchant_id)
        `);
        console.log('✅ admins表添加merchant_id索引成功');
      } catch (error) {
        if (error.message.includes("Duplicate column name 'merchant_id'")) {
          console.log('ℹ️ admins表merchant_id字段已存在');
        } else {
          throw error;
        }
      }
      
      // 2. 初始化admins表的商户ID
      const updateAdmins = await this.dataSource.query(`
        UPDATE admins 
        SET merchant_id = 1 
        WHERE merchant_id IS NULL
      `);
      
      console.log('✅ admins表商户ID初始化完成，影响行数:', updateAdmins.affectedRows);
      
      // 3. 检查结果
      const [adminStats] = await this.dataSource.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(merchant_id) as with_merchant,
          COUNT(*) - COUNT(merchant_id) as without_merchant
        FROM admins
      `);
      
      console.log('📊 admins表统计:', adminStats);
      
      return {
        success: true,
        message: '用户表商户ID字段添加完成',
        data: {
          admins: adminStats
        }
      };
    } catch (error) {
      console.error('❌ 添加商户ID字段失败:', error.message);
      return {
        success: false,
        message: '添加商户ID字段失败',
        error: error.message
      };
    }
  }

  @Post('check-users-merchant')
  @Public()
  @HttpCode(HttpStatus.OK)
  async checkUsersMerchant() {
    try {
      // 检查admins表结构
      const [adminColumns] = await this.dataSource.query(`
        SHOW COLUMNS FROM admins LIKE 'merchant_id'
      `);
      
      // 检查数据统计
      const [adminStats] = await this.dataSource.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(merchant_id) as with_merchant,
          COUNT(*) - COUNT(merchant_id) as without_merchant
        FROM admins
      `);
      
      return {
        success: true,
        message: '检查完成',
        data: {
          admins: {
            hasColumn: adminColumns.length > 0,
            ...adminStats
          }
        }
      };
    } catch (error) {
      console.error('❌ 检查失败:', error.message);
      return {
        success: false,
        message: '检查失败',
        error: error.message
      };
    }
  }
}
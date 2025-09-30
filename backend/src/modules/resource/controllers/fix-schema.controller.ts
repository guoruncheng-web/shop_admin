import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../../auth/decorators/public.decorator';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ApiTags('数据库修复')
@Controller('fix-schema')
@Public()
export class FixSchemaController {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Post('update-tables')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新数据库表结构' })
  async updateTables() {
    try {
      // 检查并添加 resource_categories 表字段
      const categoryColumns = await this.dataSource.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'resource_categories'
      `);
      const categoryColumnNames = categoryColumns.map((col) => col.COLUMN_NAME);

      if (!categoryColumnNames.includes('status')) {
        await this.dataSource.query(
          `ALTER TABLE resource_categories ADD COLUMN status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用'`,
        );
      }
      if (!categoryColumnNames.includes('sort_order')) {
        await this.dataSource.query(
          `ALTER TABLE resource_categories ADD COLUMN sort_order INT DEFAULT 0 COMMENT '排序'`,
        );
      }
      if (!categoryColumnNames.includes('created_at')) {
        await this.dataSource.query(
          `ALTER TABLE resource_categories ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
        );
      }
      if (!categoryColumnNames.includes('updated_at')) {
        await this.dataSource.query(
          `ALTER TABLE resource_categories ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
        );
      }

      // 检查并添加 resources 表字段
      const resourceColumns = await this.dataSource.query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'resources'
      `);
      const resourceColumnNames = resourceColumns.map((col) => col.COLUMN_NAME);

      if (!resourceColumnNames.includes('file_extension')) {
        await this.dataSource.query(
          `ALTER TABLE resources ADD COLUMN file_extension VARCHAR(10) COMMENT '文件扩展名'`,
        );
      }
      if (!resourceColumnNames.includes('mime_type')) {
        await this.dataSource.query(
          `ALTER TABLE resources ADD COLUMN mime_type VARCHAR(100) COMMENT 'MIME类型'`,
        );
      }
      if (!resourceColumnNames.includes('thumbnail_url')) {
        await this.dataSource.query(
          `ALTER TABLE resources ADD COLUMN thumbnail_url TEXT COMMENT '缩略图URL'`,
        );
      }
      if (!resourceColumnNames.includes('duration')) {
        await this.dataSource.query(
          `ALTER TABLE resources ADD COLUMN duration INT COMMENT '视频时长(秒)'`,
        );
      }
      if (!resourceColumnNames.includes('uploader_name')) {
        await this.dataSource.query(
          `ALTER TABLE resources ADD COLUMN uploader_name VARCHAR(100) COMMENT '上传者姓名'`,
        );
      }
      if (!resourceColumnNames.includes('width')) {
        await this.dataSource.query(
          `ALTER TABLE resources ADD COLUMN width INT COMMENT '图片宽度'`,
        );
      }
      if (!resourceColumnNames.includes('height')) {
        await this.dataSource.query(
          `ALTER TABLE resources ADD COLUMN height INT COMMENT '图片高度'`,
        );
      }
      if (!resourceColumnNames.includes('created_at')) {
        await this.dataSource.query(
          `ALTER TABLE resources ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
        );
      }
      if (!resourceColumnNames.includes('updated_at')) {
        await this.dataSource.query(
          `ALTER TABLE resources ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
        );
      }

      // 修改现有字段
      await this.dataSource.query(
        `ALTER TABLE resources MODIFY COLUMN file_size BIGINT COMMENT '文件大小(字节)'`,
      );
      await this.dataSource.query(
        `ALTER TABLE resources MODIFY COLUMN view_count INT DEFAULT 0 COMMENT '查看次数'`,
      );
      await this.dataSource.query(
        `ALTER TABLE resources MODIFY COLUMN download_count INT DEFAULT 0 COMMENT '下载次数'`,
      );
      await this.dataSource.query(
        `ALTER TABLE resources MODIFY COLUMN status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-删除'`,
      );

      return {
        code: 200,
        data: {
          success: true,
          message: '数据库表结构更新成功',
        },
        msg: 'success',
      };
    } catch (error) {
      return {
        code: 500,
        data: {
          success: false,
          message: '数据库表结构更新失败',
          error: error.message,
        },
        msg: 'error',
      };
    }
  }
}

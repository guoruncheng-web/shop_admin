import { Controller, Post, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Permission } from '../../../database/entities/permission.entity';

@Controller('api/migration')
export class MigrationController {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private dataSource: DataSource,
  ) {}

  @Post('permissions')
  async migratePermissions() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // 检查并添加缺失的字段
      try {
        // 添加 type 字段
        await queryRunner.query(`
          ALTER TABLE permissions 
          ADD COLUMN type ENUM('menu', 'button', 'api') NOT NULL DEFAULT 'menu' 
          COMMENT '权限类型：menu-菜单，button-按钮，api-接口'
        `);
        console.log('✅ 添加 type 字段成功');
      } catch (error) {
        if (!error.message.includes('Duplicate column name')) {
          console.log('⚠️ type 字段可能已存在:', error.message);
        }
      }

      try {
        // 添加 parentId 字段
        await queryRunner.query(`
          ALTER TABLE permissions 
          ADD COLUMN parentId BIGINT NULL 
          COMMENT '父级权限ID'
        `);
        console.log('✅ 添加 parentId 字段成功');
      } catch (error) {
        if (!error.message.includes('Duplicate column name')) {
          console.log('⚠️ parentId 字段可能已存在:', error.message);
        }
      }

      await queryRunner.release();

      // 检查是否有数据，如果没有则插入初始数据
      const count = await this.permissionRepository.count();
      if (count === 0) {
        const initialPermissions = [
          // 系统管理
          { name: '系统管理', code: 'system', type: 'menu' as const, description: '系统管理权限' },
          { name: '用户管理', code: 'system:user', type: 'menu' as const, description: '用户管理权限' },
          { name: '角色管理', code: 'system:role', type: 'menu' as const, description: '角色管理权限' },
          { name: '权限管理', code: 'system:permission', type: 'menu' as const, description: '权限管理权限' },
          
          // 用户管理按钮权限
          { name: '新增用户', code: 'system:user:create', type: 'button' as const, description: '新增用户权限' },
          { name: '编辑用户', code: 'system:user:update', type: 'button' as const, description: '编辑用户权限' },
          { name: '删除用户', code: 'system:user:delete', type: 'button' as const, description: '删除用户权限' },
          
          // 角色管理按钮权限
          { name: '新增角色', code: 'system:role:create', type: 'button' as const, description: '新增角色权限' },
          { name: '编辑角色', code: 'system:role:update', type: 'button' as const, description: '编辑角色权限' },
          { name: '删除角色', code: 'system:role:delete', type: 'button' as const, description: '删除角色权限' },
          { name: '分配权限', code: 'system:role:assign', type: 'button' as const, description: '分配权限权限' },
          
          // 商品管理
          { name: '商品管理', code: 'product', type: 'menu' as const, description: '商品管理权限' },
          { name: '商品列表', code: 'product:list', type: 'menu' as const, description: '商品列表权限' },
          { name: '新增商品', code: 'product:create', type: 'button' as const, description: '新增商品权限' },
          { name: '编辑商品', code: 'product:update', type: 'button' as const, description: '编辑商品权限' },
          { name: '删除商品', code: 'product:delete', type: 'button' as const, description: '删除商品权限' },
          
          // 订单管理
          { name: '订单管理', code: 'order', type: 'menu' as const, description: '订单管理权限' },
          { name: '订单列表', code: 'order:list', type: 'menu' as const, description: '订单列表权限' },
          { name: '订单详情', code: 'order:detail', type: 'button' as const, description: '订单详情权限' },
          { name: '更新订单', code: 'order:update', type: 'button' as const, description: '更新订单权限' },
        ];

        for (const permData of initialPermissions) {
          const permission = this.permissionRepository.create(permData);
          await this.permissionRepository.save(permission);
        }
      }

      return {
        success: true,
        message: '权限表迁移完成',
        data: {
          totalPermissions: await this.permissionRepository.count()
        }
      };

    } catch (error) {
      return {
        success: false,
        message: '迁移失败',
        error: error.message
      };
    }
  }

  @Get('permissions/status')
  async getPermissionStatus() {
    try {
      const count = await this.permissionRepository.count();
      const permissions = await this.permissionRepository.find({
        take: 10,
        order: { id: 'ASC' }
      });

      return {
        success: true,
        data: {
          totalCount: count,
          samplePermissions: permissions
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}
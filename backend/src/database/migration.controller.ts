import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { Menu } from '../modules/menus/entities/menu.entity';
import { Role } from './entities/role.entity';
import { Admin } from './entities/admin.entity';

@ApiTags('数据库迁移')
@Controller('migration')
export class MigrationController {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
  ) {}

  @Post('update-permissions-table')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新权限表结构' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updatePermissionsTable() {
    try {
      // 检查menu_id列是否存在，如果不存在则添加
      try {
        await this.permissionRepository.query(`
          ALTER TABLE permissions ADD COLUMN menu_id BIGINT NULL COMMENT '关联菜单ID'
        `);
      } catch (error) {
        if (!error.message.includes('Duplicate column name')) {
          throw error;
        }
      }

      // 检查parent_id列是否存在，如果不存在则添加
      try {
        await this.permissionRepository.query(`
          ALTER TABLE permissions ADD COLUMN parent_id BIGINT NULL COMMENT '父权限ID'
        `);
      } catch (error) {
        if (!error.message.includes('Duplicate column name')) {
          throw error;
        }
      }
      
      // 添加外键约束
      try {
        await this.permissionRepository.query(`
          ALTER TABLE permissions ADD CONSTRAINT fk_permissions_menu_id 
          FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE SET NULL
        `);
      } catch (error) {
        if (!error.message.includes('Duplicate key name')) {
          console.log('菜单外键约束可能已存在:', error.message);
        }
      }

      // 添加父权限外键约束
      try {
        await this.permissionRepository.query(`
          ALTER TABLE permissions ADD CONSTRAINT fk_permissions_parent_id 
          FOREIGN KEY (parent_id) REFERENCES permissions(id) ON DELETE SET NULL
        `);
      } catch (error) {
        if (!error.message.includes('Duplicate key name')) {
          console.log('父权限外键约束可能已存在:', error.message);
        }
      }
      
      // 创建索引
      try {
        await this.permissionRepository.query(`
          CREATE INDEX idx_permissions_menu_id ON permissions(menu_id)
        `);
      } catch (error) {
        if (!error.message.includes('Duplicate key name')) {
          console.log('索引可能已存在:', error.message);
        }
      }
      
      try {
        await this.permissionRepository.query(`
          CREATE INDEX idx_permissions_parent_id ON permissions(parent_id)
        `);
      } catch (error) {
        if (!error.message.includes('Duplicate key name')) {
          console.log('索引可能已存在:', error.message);
        }
      }

      return {
        code: 200,
        data: {},
        msg: '权限表结构更新成功',
      };
    } catch (error) {
      console.error('权限表结构更新失败:', error);
      return {
        code: 500,
        data: {},
        msg: `更新失败: ${error.message}`,
      };
    }
  }

  @Post('clean-rbac-data')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '清理RBAC数据' })
  @ApiResponse({ status: 200, description: '清理成功' })
  async cleanRbacData() {
    try {
      // 清理角色权限关联表
      await this.permissionRepository.query('DELETE FROM role_permissions');
      
      // 清理管理员角色关联表
      await this.permissionRepository.query('DELETE FROM admin_roles');
      
      // 清理权限数据
      await this.permissionRepository.query('DELETE FROM permissions WHERE code LIKE "system%"');
      
      // 清理角色数据
      await this.permissionRepository.query('DELETE FROM roles WHERE code = "super_admin"');

      return {
        code: 200,
        data: {},
        msg: 'RBAC数据清理成功',
      };
    } catch (error) {
      console.error('RBAC数据清理失败:', error);
      return {
        code: 500,
        data: {},
        msg: `清理失败: ${error.message}`,
      };
    }
  }

  @Post('init-rbac-system')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '初始化RBAC权限系统' })
  @ApiResponse({ status: 200, description: '初始化成功' })
  async initRbacSystem() {
    try {
      // 1. 创建基础权限数据
      await this.createBasePermissions();
      
      // 2. 建立菜单与权限的关联
      await this.linkMenusWithPermissions();
      
      // 3. 创建测试角色和用户
      await this.createTestRoleAndUser();

      return {
        code: 200,
        data: {},
        msg: 'RBAC权限系统初始化成功',
      };
    } catch (error) {
      console.error('RBAC系统初始化失败:', error);
      return {
        code: 500,
        data: {},
        msg: `初始化失败: ${error.message}`,
      };
    }
  }

  private async createBasePermissions() {
    // 系统管理权限
    const systemPermissions = [
      { name: '系统管理', code: 'system', type: 'menu' as const, description: '系统管理模块' },
      { name: '菜单管理', code: 'system:menu', type: 'menu' as const, description: '菜单管理', parentCode: 'system' },
      { name: '角色管理', code: 'system:role', type: 'menu' as const, description: '角色管理', parentCode: 'system' },
      { name: '用户管理', code: 'system:user', type: 'menu' as const, description: '用户管理', parentCode: 'system' },
      
      // 菜单管理按钮权限
      { name: '查看菜单', code: 'system:menu:view', type: 'button' as const, description: '查看菜单列表', parentCode: 'system:menu' },
      { name: '新增菜单', code: 'system:menu:add', type: 'button' as const, description: '新增菜单', parentCode: 'system:menu' },
      { name: '编辑菜单', code: 'system:menu:edit', type: 'button' as const, description: '编辑菜单', parentCode: 'system:menu' },
      { name: '删除菜单', code: 'system:menu:delete', type: 'button' as const, description: '删除菜单', parentCode: 'system:menu' },
      
      // 角色管理按钮权限
      { name: '查看角色', code: 'system:role:view', type: 'button' as const, description: '查看角色列表', parentCode: 'system:role' },
      { name: '新增角色', code: 'system:role:add', type: 'button' as const, description: '新增角色', parentCode: 'system:role' },
      { name: '编辑角色', code: 'system:role:edit', type: 'button' as const, description: '编辑角色', parentCode: 'system:role' },
      { name: '删除角色', code: 'system:role:delete', type: 'button' as const, description: '删除角色', parentCode: 'system:role' },
      { name: '分配权限', code: 'system:role:assign', type: 'button' as const, description: '分配角色权限', parentCode: 'system:role' },
      
      // 用户管理按钮权限
      { name: '查看用户', code: 'system:user:view', type: 'button' as const, description: '查看用户列表', parentCode: 'system:user' },
      { name: '新增用户', code: 'system:user:add', type: 'button' as const, description: '新增用户', parentCode: 'system:user' },
      { name: '编辑用户', code: 'system:user:edit', type: 'button' as const, description: '编辑用户', parentCode: 'system:user' },
      { name: '删除用户', code: 'system:user:delete', type: 'button' as const, description: '删除用户', parentCode: 'system:user' },
    ];

    // 创建权限映射表
    const permissionMap = new Map<string, Permission>();

    // 先创建所有权限
    for (const permData of systemPermissions) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { code: permData.code }
      });

      if (!existingPermission) {
        const permission = this.permissionRepository.create({
          name: permData.name,
          code: permData.code,
          type: permData.type,
          description: permData.description,
          status: 1,
        });
        
        const savedPermission = await this.permissionRepository.save(permission);
        permissionMap.set(permData.code, savedPermission);
      } else {
        permissionMap.set(permData.code, existingPermission);
      }
    }

    // 建立父子关系
    for (const permData of systemPermissions) {
      if (permData.parentCode) {
        const permission = permissionMap.get(permData.code);
        const parent = permissionMap.get(permData.parentCode);
        
        if (permission && parent) {
          permission.parentId = parent.id;
          await this.permissionRepository.save(permission);
        }
      }
    }
  }

  private async linkMenusWithPermissions() {
    // 查找对应的菜单并建立关联
    const menuPermissionLinks = [
      { menuPath: '/system', permissionCode: 'system' },
      { menuPath: '/system/menu', permissionCode: 'system:menu' },
      { menuPath: '/system/role', permissionCode: 'system:role' },
      { menuPath: '/system/user', permissionCode: 'system:user' },
    ];

    for (const link of menuPermissionLinks) {
      const menu = await this.menuRepository.findOne({
        where: { path: link.menuPath }
      });
      
      const permission = await this.permissionRepository.findOne({
        where: { code: link.permissionCode }
      });

      if (menu && permission) {
        permission.menuId = menu.id;
        await this.permissionRepository.save(permission);
      }
    }
  }

  @Post('fix-permission-hierarchy')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '修复权限层级结构' })
  @ApiResponse({ status: 200, description: '修复成功' })
  async fixPermissionHierarchy() {
    try {
      // 修复商品管理权限层级
      await this.fixProductPermissions();
      
      // 修复订单管理权限层级
      await this.fixOrderPermissions();

      // 修复系统管理权限名称
      await this.fixSystemPermissionNames();

      return {
        code: 200,
        data: {},
        msg: '权限层级结构修复成功',
      };
    } catch (error) {
      console.error('权限层级结构修复失败:', error);
      return {
        code: 500,
        data: {},
        msg: `修复失败: ${error.message}`,
      };
    }
  }

  @Post('check-permissions-data')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '检查权限数据' })
  @ApiResponse({ status: 200, description: '检查成功' })
  async checkPermissionsData() {
    try {
      const permissions = await this.permissionRepository.find({
        where: { status: 1 },
        order: { id: 'ASC' },
      });

      return {
        code: 200,
        data: permissions,
        msg: '权限数据查询成功',
      };
    } catch (error) {
      console.error('权限数据查询失败:', error);
      return {
        code: 500,
        data: {},
        msg: `查询失败: ${error.message}`,
      };
    }
  }

  private async fixSystemPermissionNames() {
    const systemPermissions = [
      { code: 'system', name: '系统管理' },
      { code: 'system:menu', name: '菜单管理' },
      { code: 'system:role', name: '角色管理' },
      { code: 'system:user', name: '用户管理' },
      { code: 'system:menu:view', name: '查看菜单' },
      { code: 'system:menu:add', name: '新增菜单' },
      { code: 'system:menu:edit', name: '编辑菜单' },
      { code: 'system:menu:delete', name: '删除菜单' },
      { code: 'system:role:view', name: '查看角色' },
      { code: 'system:role:add', name: '新增角色' },
      { code: 'system:role:edit', name: '编辑角色' },
      { code: 'system:role:delete', name: '删除角色' },
      { code: 'system:role:assign', name: '分配权限' },
      { code: 'system:user:view', name: '查看用户' },
      { code: 'system:user:add', name: '新增用户' },
      { code: 'system:user:edit', name: '编辑用户' },
      { code: 'system:user:delete', name: '删除用户' },
    ];

    for (const permData of systemPermissions) {
      const permission = await this.permissionRepository.findOne({
        where: { code: permData.code }
      });

      if (permission) {
        permission.name = permData.name;
        await this.permissionRepository.save(permission);
        console.log(`Updated permission: ${permData.code} -> ${permData.name}`);
      } else {
        console.log(`Permission not found: ${permData.code}`);
      }
    }
  }

  private async fixProductPermissions() {
    // 1. 创建商品管理父级菜单权限
    let productParent = await this.permissionRepository.findOne({
      where: { code: 'product' }
    });

    if (!productParent) {
      productParent = this.permissionRepository.create({
        name: '商品管理',
        code: 'product',
        type: 'menu',
        description: '商品管理模块',
        status: 1,
        parentId: null,
      });
      productParent = await this.permissionRepository.save(productParent);
    } else {
      // 更新已存在的父级权限名称
      productParent.name = '商品管理';
      await this.permissionRepository.save(productParent);
    }

    // 2. 更新商品相关权限的层级关系和类型
    const productPermissions = [
      { code: 'product:list', name: '商品列表', type: 'menu' },
      { code: 'product:add', name: '商品新增', type: 'button' },
      { code: 'product:edit', name: '商品编辑', type: 'button' },
      { code: 'product:delete', name: '商品删除', type: 'button' },
    ];

    for (const permData of productPermissions) {
      const permission = await this.permissionRepository.findOne({
        where: { code: permData.code }
      });

      if (permission) {
        permission.parentId = productParent.id;
        permission.type = permData.type as any;
        permission.name = permData.name;
        await this.permissionRepository.save(permission);
      }
    }
  }

  private async fixOrderPermissions() {
    // 1. 创建订单管理父级菜单权限
    let orderParent = await this.permissionRepository.findOne({
      where: { code: 'order' }
    });

    if (!orderParent) {
      orderParent = this.permissionRepository.create({
        name: '订单管理',
        code: 'order',
        type: 'menu',
        description: '订单管理模块',
        status: 1,
        parentId: null,
      });
      orderParent = await this.permissionRepository.save(orderParent);
    } else {
      // 更新已存在的父级权限名称
      orderParent.name = '订单管理';
      await this.permissionRepository.save(orderParent);
    }

    // 2. 更新订单相关权限的层级关系和类型
    const orderPermissions = [
      { code: 'order:list', name: '订单列表', type: 'menu' },
      { code: 'order:detail', name: '订单详情', type: 'button' },
    ];

    for (const permData of orderPermissions) {
      const permission = await this.permissionRepository.findOne({
        where: { code: permData.code }
      });

      if (permission) {
        permission.parentId = orderParent.id;
        permission.type = permData.type as any;
        permission.name = permData.name;
        await this.permissionRepository.save(permission);
      }
    }
  }

  private async createTestRoleAndUser() {
    // 创建超级管理员角色
    let superAdminRole = await this.roleRepository.findOne({
      where: { code: 'super_admin' }
    });

    if (!superAdminRole) {
      superAdminRole = this.roleRepository.create({
        name: '超级管理员',
        code: 'super_admin',
        description: '系统超级管理员，拥有所有权限',
        status: 1,
      });
      superAdminRole = await this.roleRepository.save(superAdminRole);
    }

    // 给超级管理员角色分配所有权限
    const allPermissions = await this.permissionRepository.find({
      where: { status: 1 }
    });
    
    superAdminRole.permissions = allPermissions;
    await this.roleRepository.save(superAdminRole);

    // 创建测试管理员用户
    let adminUser = await this.adminRepository.findOne({
      where: { username: 'admin' }
    });

    if (!adminUser) {
      adminUser = this.adminRepository.create({
        username: 'admin',
        password: '$2b$10$N.zmdr9k7uOCQb376NoUnuTJ8iKXieNjMm8rI5lHDxGwwkjTlBeQy', // 123456
        realName: '系统管理员',
        email: 'admin@example.com',
        phone: '13800138000',
        status: 1,
      });
      adminUser = await this.adminRepository.save(adminUser);
    }

    // 给管理员分配超级管理员角色
    adminUser.roles = [superAdminRole];
    await this.adminRepository.save(adminUser);
  }
}
import { Controller, Post, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { Menu } from '../modules/menus/entities/menu.entity';
import { Role } from './entities/role.entity';
import { Admin } from './entities/admin.entity';
import { RoleMenu } from './entities/role-menu.entity';

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
    @InjectDataSource()
    private dataSource: DataSource,
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
      await this.permissionRepository.query(
        'DELETE FROM permissions WHERE code LIKE "system%"',
      );

      // 清理角色数据
      await this.permissionRepository.query(
        'DELETE FROM roles WHERE code = "super_admin"',
      );

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
      {
        name: '系统管理',
        code: 'system',
        type: 'menu' as const,
        description: '系统管理模块',
      },
      {
        name: '菜单管理',
        code: 'system:menu',
        type: 'menu' as const,
        description: '菜单管理',
        parentCode: 'system',
      },
      {
        name: '角色管理',
        code: 'system:role',
        type: 'menu' as const,
        description: '角色管理',
        parentCode: 'system',
      },
      {
        name: '用户管理',
        code: 'system:user',
        type: 'menu' as const,
        description: '用户管理',
        parentCode: 'system',
      },

      // 菜单管理按钮权限
      {
        name: '查看菜单',
        code: 'system:menu:view',
        type: 'button' as const,
        description: '查看菜单列表',
        parentCode: 'system:menu',
      },
      {
        name: '新增菜单',
        code: 'system:menu:add',
        type: 'button' as const,
        description: '新增菜单',
        parentCode: 'system:menu',
      },
      {
        name: '编辑菜单',
        code: 'system:menu:edit',
        type: 'button' as const,
        description: '编辑菜单',
        parentCode: 'system:menu',
      },
      {
        name: '删除菜单',
        code: 'system:menu:delete',
        type: 'button' as const,
        description: '删除菜单',
        parentCode: 'system:menu',
      },

      // 角色管理按钮权限
      {
        name: '查看角色',
        code: 'system:role:view',
        type: 'button' as const,
        description: '查看角色列表',
        parentCode: 'system:role',
      },
      {
        name: '新增角色',
        code: 'system:role:add',
        type: 'button' as const,
        description: '新增角色',
        parentCode: 'system:role',
      },
      {
        name: '编辑角色',
        code: 'system:role:edit',
        type: 'button' as const,
        description: '编辑角色',
        parentCode: 'system:role',
      },
      {
        name: '删除角色',
        code: 'system:role:delete',
        type: 'button' as const,
        description: '删除角色',
        parentCode: 'system:role',
      },
      {
        name: '分配权限',
        code: 'system:role:assign',
        type: 'button' as const,
        description: '分配角色权限',
        parentCode: 'system:role',
      },

      // 用户管理按钮权限
      {
        name: '查看用户',
        code: 'system:user:view',
        type: 'button' as const,
        description: '查看用户列表',
        parentCode: 'system:user',
      },
      {
        name: '新增用户',
        code: 'system:user:add',
        type: 'button' as const,
        description: '新增用户',
        parentCode: 'system:user',
      },
      {
        name: '编辑用户',
        code: 'system:user:edit',
        type: 'button' as const,
        description: '编辑用户',
        parentCode: 'system:user',
      },
      {
        name: '删除用户',
        code: 'system:user:delete',
        type: 'button' as const,
        description: '删除用户',
        parentCode: 'system:user',
      },
    ];

    // 创建权限映射表
    const permissionMap = new Map<string, Permission>();

    // 先创建所有权限
    for (const permData of systemPermissions) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { code: permData.code },
      });

      if (!existingPermission) {
        const permission = this.permissionRepository.create({
          name: permData.name,
          code: permData.code,
          type: permData.type,
          description: permData.description,
          status: 1,
        });

        const savedPermission =
          await this.permissionRepository.save(permission);
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
        where: { path: link.menuPath },
      });

      const permission = await this.permissionRepository.findOne({
        where: { code: link.permissionCode },
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
        where: { code: permData.code },
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
      where: { code: 'product' },
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
        where: { code: permData.code },
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
      where: { code: 'order' },
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
        where: { code: permData.code },
      });

      if (permission) {
        permission.parentId = orderParent.id;
        permission.type = permData.type as any;
        permission.name = permData.name;
        await this.permissionRepository.save(permission);
      }
    }
  }

  @Post('add-system-permissions-to-super-admin')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '为超级管理员角色添加系统管理权限' })
  @ApiResponse({ status: 200, description: '添加成功' })
  async addSystemPermissionsToSuperAdmin() {
    try {
      // 查找super_admin角色
      const superAdminRole = await this.roleRepository.findOne({
        where: { code: 'super_admin' },
        relations: ['permissions'],
      });

      if (!superAdminRole) {
        return {
          code: 404,
          data: {},
          msg: '超级管理员角色不存在',
        };
      }

      // 获取当前角色已有的权限ID
      const currentPermissionIds = superAdminRole.permissions.map((p) => p.id);
      console.log('当前权限IDs:', currentPermissionIds);

      // 获取所有系统管理权限（ID 62-78）
      const systemPermissionIds = [
        62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
      ];

      // 找出缺少的系统权限
      const missingPermissionIds = systemPermissionIds.filter(
        (id) => !currentPermissionIds.includes(id),
      );
      console.log('缺少的系统权限IDs:', missingPermissionIds);

      if (missingPermissionIds.length === 0) {
        return {
          code: 200,
          data: {},
          msg: '超级管理员角色已拥有所有系统管理权限',
        };
      }

      // 获取缺少的权限实体
      const missingPermissions =
        await this.permissionRepository.findByIds(missingPermissionIds);
      console.log(
        '找到的缺少权限:',
        missingPermissions.map((p) => ({ id: p.id, code: p.code })),
      );

      // 合并权限：现有权限 + 缺少的系统权限
      const allPermissions = [
        ...superAdminRole.permissions,
        ...missingPermissions,
      ];

      // 直接使用SQL插入避免重复键错误
      for (const permissionId of missingPermissionIds) {
        try {
          await this.permissionRepository.query(
            'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
            [superAdminRole.id, permissionId],
          );
          console.log(
            `成功添加权限 ${permissionId} 到角色 ${superAdminRole.id}`,
          );
        } catch (error) {
          console.log(`权限 ${permissionId} 可能已存在:`, error.message);
        }
      }

      return {
        code: 200,
        data: {
          addedPermissions: missingPermissionIds,
          totalPermissions:
            currentPermissionIds.length + missingPermissionIds.length,
        },
        msg: `成功为超级管理员角色添加 ${missingPermissionIds.length} 个系统管理权限`,
      };
    } catch (error) {
      console.error('添加系统权限失败:', error);
      return {
        code: 500,
        data: {},
        msg: `添加失败: ${error.message}`,
      };
    }
  }

  @Post('check-menu-data')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '检查菜单数据' })
  @ApiResponse({ status: 200, description: '检查成功' })
  async checkMenuData() {
    try {
      const menus = await this.menuRepository.find({
        where: { status: 1 },
        order: { id: 'ASC' },
      });

      return {
        code: 200,
        data: menus,
        msg: '菜单数据查询成功',
      };
    } catch (error) {
      console.error('菜单数据查询失败:', error);
      return {
        code: 500,
        data: {},
        msg: `查询失败: ${error.message}`,
      };
    }
  }

  @Post('update-menu-with-auto-component')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '编辑菜单并自动设置组件' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateMenuWithAutoComponent() {
    try {
      // 示例：更新菜单并自动设置组件
      const menuId = 40; // 示例菜单ID
      const updateData = {
        name: '资源管理',
        type: 1, // 目录类型
        // 其他更新字段...
      };

      // 查找要更新的菜单
      const menu = await this.menuRepository.findOne({
        where: { id: menuId },
      });

      if (!menu) {
        return {
          code: 404,
          data: {},
          msg: '菜单不存在',
        };
      }

      // 根据菜单类型自动设置组件
      let component = menu.component; // 保持原有组件

      if (updateData.type !== undefined) {
        // 如果类型发生变化，自动设置组件
        if (updateData.type === 1) {
          // 目录类型使用 BasicLayout
          component = 'BasicLayout';
        } else if (updateData.type === 2) {
          // 页面类型：如果原来是BasicLayout，则清空让用户手动设置
          if (menu.component === 'BasicLayout') {
            component = '';
          }
          // 如果原来就有具体组件路径，保持不变
        } else if (updateData.type === 3) {
          // 按钮类型不需要组件
          component = '';
        }
      }

      // 更新菜单
      Object.assign(menu, updateData, { component });
      const savedMenu = await this.menuRepository.save(menu);

      return {
        code: 200,
        data: {
          menu: savedMenu,
          autoSetComponent: component,
          rule: {
            type1: '目录类型 → component = "BasicLayout"',
            type2: '页面类型 → component = "具体组件路径" (需手动设置)',
            type3: '按钮类型 → component = ""',
          },
        },
        msg: '菜单更新成功，组件已自动调整',
      };
    } catch (error) {
      console.error('更新菜单失败:', error);
      return {
        code: 500,
        data: {},
        msg: `更新失败: ${error.message}`,
      };
    }
  }

  @Post('create-menu-with-auto-component')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建菜单并自动设置组件' })
  @ApiResponse({ status: 200, description: '创建成功' })
  async createMenuWithAutoComponent() {
    try {
      // 示例：创建一个新的目录菜单
      const menuData = {
        name: '示例目录',
        path: '/example',
        title: '示例目录',
        icon: 'ion:folder-outline',
        type: 1, // 目录类型
        status: 1,
        orderNum: 99,
        parentId: null,
      };

      // 根据菜单类型自动设置组件
      let component = '';
      if (menuData.type === 1) {
        // 目录类型使用 BasicLayout
        component = 'BasicLayout';
      } else if (menuData.type === 2) {
        // 页面类型需要指定具体的组件路径
        // 这里可以根据路径自动生成，或者由前端传入
        component = ''; // 页面类型需要手动指定
      } else if (menuData.type === 3) {
        // 按钮类型不需要组件
        component = '';
      }

      const menu = this.menuRepository.create({
        ...menuData,
        component,
      });

      const savedMenu = await this.menuRepository.save(menu);

      return {
        code: 200,
        data: {
          menu: savedMenu,
          autoSetComponent: component,
          rule: {
            type1: '目录类型 → component = "BasicLayout"',
            type2: '页面类型 → component = "具体组件路径"',
            type3: '按钮类型 → component = ""',
          },
        },
        msg: '菜单创建成功，组件已自动设置',
      };
    } catch (error) {
      console.error('创建菜单失败:', error);
      return {
        code: 500,
        data: {},
        msg: `创建失败: ${error.message}`,
      };
    }
  }

  @Post('fix-static-menu-config')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '修复静态资源菜单配置' })
  @ApiResponse({ status: 200, description: '修复成功' })
  async fixStaticMenuConfig() {
    try {
      // 查找"静态资源"菜单
      const staticMenu = await this.menuRepository.findOne({
        where: { name: '静态资源' },
      });

      if (staticMenu) {
        // 修复静态资源菜单配置
        staticMenu.path = '/media/static'; // 修正路径
        staticMenu.component = 'medial/static/index'; // 设置正确的组件路径
        staticMenu.type = 2; // 确保是页面类型
        await this.menuRepository.save(staticMenu);

        return {
          code: 200,
          data: {
            updated: {
              id: staticMenu.id,
              name: staticMenu.name,
              path: staticMenu.path,
              component: staticMenu.component,
              type: staticMenu.type,
            },
          },
          msg: '静态资源菜单配置修复成功',
        };
      } else {
        return {
          code: 404,
          data: {},
          msg: '未找到静态资源菜单',
        };
      }
    } catch (error) {
      console.error('修复静态资源菜单配置失败:', error);
      return {
        code: 500,
        data: {},
        msg: `修复失败: ${error.message}`,
      };
    }
  }

  @Post('fix-media-menu-component')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '修复媒体菜单组件配置' })
  @ApiResponse({ status: 200, description: '修复成功' })
  async fixMediaMenuComponent() {
    try {
      // 查找"资源"菜单
      const mediaMenu = await this.menuRepository.findOne({
        where: { path: '/media' },
      });

      if (mediaMenu) {
        // 目录类型的菜单应该使用 BasicLayout，不应该有具体的组件路径
        mediaMenu.component = 'BasicLayout';
        await this.menuRepository.save(mediaMenu);

        return {
          code: 200,
          data: {
            updated: {
              id: mediaMenu.id,
              name: mediaMenu.name,
              path: mediaMenu.path,
              component: mediaMenu.component,
            },
          },
          msg: '媒体菜单组件配置修复成功',
        };
      } else {
        return {
          code: 404,
          data: {},
          msg: '未找到媒体菜单',
        };
      }
    } catch (error) {
      console.error('修复媒体菜单组件配置失败:', error);
      return {
        code: 500,
        data: {},
        msg: `修复失败: ${error.message}`,
      };
    }
  }

  @Post('check-database-connection')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '检查数据库连接状态' })
  @ApiResponse({ status: 200, description: '检查成功' })
  async checkDatabaseConnection() {
    try {
      // 检查数据库连接
      await this.permissionRepository.query('SELECT 1 as test');

      // 检查表是否存在
      const tables = await this.permissionRepository.query(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME IN ('permissions', 'menus', 'roles', 'admins', 'role_permissions', 'admin_roles')
      `);

      // 检查权限表数据
      const permissionCount = await this.permissionRepository.count();

      // 检查菜单表数据
      const menuCount = await this.menuRepository.count();

      return {
        code: 200,
        data: {
          connection: 'success',
          tables: tables.map((t) => t.TABLE_NAME),
          counts: {
            permissions: permissionCount,
            menus: menuCount,
          },
        },
        msg: '数据库连接正常',
      };
    } catch (error) {
      console.error('数据库连接检查失败:', error);
      return {
        code: 500,
        data: {
          connection: 'failed',
          error: error.message,
        },
        msg: `数据库连接失败: ${error.message}`,
      };
    }
  }

  @Post('create-media-permissions')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建媒体资源权限' })
  @ApiResponse({ status: 200, description: '创建成功' })
  async createMediaPermissions() {
    try {
      // 媒体资源权限数据
      const mediaPermissions = [
        {
          name: '资源',
          code: 'media',
          type: 'menu' as const,
          description: '媒体资源管理模块',
        },
        {
          name: '静态资源',
          code: 'media:static',
          type: 'menu' as const,
          description: '静态资源管理',
          parentCode: 'media',
        },
        {
          name: '查看静态资源',
          code: 'media:static:view',
          type: 'button' as const,
          description: '查看静态资源列表',
          parentCode: 'media:static',
        },
        {
          name: '上传静态资源',
          code: 'media:static:upload',
          type: 'button' as const,
          description: '上传静态资源',
          parentCode: 'media:static',
        },
        {
          name: '删除静态资源',
          code: 'media:static:delete',
          type: 'button' as const,
          description: '删除静态资源',
          parentCode: 'media:static',
        },
      ];

      // 创建权限映射表
      const permissionMap = new Map<string, Permission>();

      // 先创建所有权限
      for (const permData of mediaPermissions) {
        const existingPermission = await this.permissionRepository.findOne({
          where: { code: permData.code },
        });

        if (!existingPermission) {
          const permission = this.permissionRepository.create({
            name: permData.name,
            code: permData.code,
            type: permData.type,
            description: permData.description,
            status: 1,
          });

          const savedPermission =
            await this.permissionRepository.save(permission);
          permissionMap.set(permData.code, savedPermission);
          console.log(`创建权限: ${permData.code} -> ${permData.name}`);
        } else {
          permissionMap.set(permData.code, existingPermission);
          console.log(`权限已存在: ${permData.code}`);
        }
      }

      // 建立父子关系
      for (const permData of mediaPermissions) {
        if (permData.parentCode) {
          const permission = permissionMap.get(permData.code);
          const parent = permissionMap.get(permData.parentCode);

          if (permission && parent) {
            permission.parentId = parent.id;
            await this.permissionRepository.save(permission);
            console.log(
              `建立父子关系: ${permData.code} -> ${permData.parentCode}`,
            );
          }
        }
      }

      // 自动为super_admin角色添加这些权限
      const superAdminRole = await this.roleRepository.findOne({
        where: { code: 'super_admin' },
        relations: ['permissions'],
      });

      if (superAdminRole) {
        const newPermissions = Array.from(permissionMap.values());
        const currentPermissionIds = superAdminRole.permissions.map(
          (p) => p.id,
        );

        for (const permission of newPermissions) {
          if (!currentPermissionIds.includes(permission.id)) {
            try {
              await this.permissionRepository.query(
                'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
                [superAdminRole.id, permission.id],
              );
              console.log(`为super_admin添加权限: ${permission.code}`);
            } catch (error) {
              console.log(`权限可能已存在: ${permission.code}`);
            }
          }
        }
      }

      return {
        code: 200,
        data: {
          createdPermissions: Array.from(permissionMap.values()).map((p) => ({
            id: p.id,
            code: p.code,
            name: p.name,
            type: p.type,
          })),
        },
        msg: '媒体资源权限创建成功',
      };
    } catch (error) {
      console.error('媒体资源权限创建失败:', error);
      return {
        code: 500,
        data: {},
        msg: `创建失败: ${error.message}`,
      };
    }
  }

  private async createTestRoleAndUser() {
    // 创建超级管理员角色
    let superAdminRole = await this.roleRepository.findOne({
      where: { code: 'super_admin' },
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
      where: { status: 1 },
    });

    superAdminRole.permissions = allPermissions;
    await this.roleRepository.save(superAdminRole);

    // 创建测试管理员用户
    let adminUser = await this.adminRepository.findOne({
      where: { username: 'admin' },
    });

    if (!adminUser) {
      adminUser = this.adminRepository.create({
        username: 'admin',
        password:
          '$2b$10$N.zmdr9k7uOCQb376NoUnuTJ8iKXieNjMm8rI5lHDxGwwkjTlBeQy', // 123456
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

  @Post('create-role-menus-table')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建角色菜单关联表' })
  @ApiResponse({ status: 200, description: '创建成功' })
  async createRoleMenusTable() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();

      await queryRunner.connect();

      // 检查表是否存在
      const tableExists = await queryRunner.hasTable('role_menus');

      if (!tableExists) {
        console.log('创建 role_menus 表...');

        await queryRunner.query(`
          CREATE TABLE \`role_menus\` (
            \`id\` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
            \`role_id\` bigint NOT NULL COMMENT '角色ID',
            \`menu_id\` bigint NOT NULL COMMENT '菜单ID',
            \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
            \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`uk_role_menu\` (\`role_id\`,\`menu_id\`),
            KEY \`idx_role_id\` (\`role_id\`),
            KEY \`idx_menu_id\` (\`menu_id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色菜单关联表'
        `);

        // 添加外键约束（如果相关表存在）
        const rolesTableExists = await queryRunner.hasTable('roles');
        const menusTableExists = await queryRunner.hasTable('menus');

        if (rolesTableExists) {
          try {
            await queryRunner.query(`
              ALTER TABLE \`role_menus\` 
              ADD CONSTRAINT \`fk_role_menus_role_id\` 
              FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON DELETE CASCADE
            `);
          } catch (error) {
            console.log('外键约束已存在或添加失败:', error.message);
          }
        }

        if (menusTableExists) {
          try {
            await queryRunner.query(`
              ALTER TABLE \`role_menus\` 
              ADD CONSTRAINT \`fk_role_menus_menu_id\` 
              FOREIGN KEY (\`menu_id\`) REFERENCES \`menus\` (\`id\`) ON DELETE CASCADE
            `);
          } catch (error) {
            console.log('外键约束已存在或添加失败:', error.message);
          }
        }

        await queryRunner.release();

        return {
          code: 200,
          data: { created: true },
          msg: 'role_menus 表创建成功',
        };
      } else {
        await queryRunner.release();

        return {
          code: 200,
          data: { created: false },
          msg: 'role_menus 表已存在',
        };
      }
    } catch (error) {
      console.error('创建 role_menus 表失败:', error);
      return {
        code: 500,
        data: null,
        msg: `创建失败: ${error.message}`,
      };
    }
  }

  @Get('check-role-menus-table')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '检查角色菜单表状态' })
  @ApiResponse({ status: 200, description: '检查成功' })
  async checkRoleMenusTable() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();

      await queryRunner.connect();

      const tableExists = await queryRunner.hasTable('role_menus');

      if (!tableExists) {
        await queryRunner.release();
        return {
          code: 200,
          data: {
            exists: false,
            message: '角色菜单表不存在，需要创建',
          },
          msg: '表不存在',
        };
      }

      // 获取表结构信息
      const columns = await queryRunner.query(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'role_menus'
        ORDER BY ORDINAL_POSITION
      `);

      const indexes = await queryRunner.query(`
        SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE
        FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'role_menus'
        ORDER BY INDEX_NAME, SEQ_IN_INDEX
      `);

      // 检查数据量
      const countResult = await queryRunner.query(
        `SELECT COUNT(*) as count FROM role_menus`,
      );
      const recordCount = countResult[0].count;

      await queryRunner.release();

      return {
        code: 200,
        data: {
          exists: true,
          columns: columns,
          indexes: indexes,
          recordCount: recordCount,
          message: '角色菜单表存在且结构正常',
        },
        msg: '检查完成',
      };
    } catch (error) {
      console.error('检查 role_menus 表失败:', error);
      return {
        code: 500,
        data: null,
        msg: `检查失败: ${error.message}`,
      };
    }
  }

  @Post('assign-all-menus-to-super-admin')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '为超级管理员分配所有菜单权限' })
  @ApiResponse({ status: 200, description: '分配成功' })
  async assignAllMenusToSuperAdmin() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // 1. 查找超级管理员角色
      const superAdminRole = await this.roleRepository.findOne({
        where: { code: 'super_admin' },
      });

      if (!superAdminRole) {
        return {
          code: 404,
          data: null,
          msg: '超级管理员角色不存在，请先创建角色',
        };
      }

      // 2. 获取所有菜单
      const allMenus = await this.menuRepository.find({
        where: { status: 1 }, // 只获取启用的菜单
        select: ['id', 'name', 'title', 'type'],
      });

      if (allMenus.length === 0) {
        return {
          code: 404,
          data: null,
          msg: '没有找到可分配的菜单',
        };
      }

      // 3. 删除超级管理员现有的菜单关联
      await queryRunner.query(
        `
        DELETE FROM role_menus WHERE role_id = ?
      `,
        [superAdminRole.id],
      );

      // 4. 为超级管理员分配所有菜单
      const menuIds = allMenus.map((menu) => menu.id);
      const roleMenus = menuIds.map((menuId) => ({
        role_id: superAdminRole.id,
        menu_id: menuId,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      // 批量插入角色菜单关联
      if (roleMenus.length > 0) {
        const values = roleMenus
          .map((rm) => `(${rm.role_id}, ${rm.menu_id}, NOW(), NOW())`)
          .join(', ');

        await queryRunner.query(`
          INSERT INTO role_menus (role_id, menu_id, created_at, updated_at) 
          VALUES ${values}
        `);
      }

      await queryRunner.release();

      // 5. 统计分配结果
      const menusByType = allMenus.reduce(
        (acc, menu) => {
          const type =
            menu.type === 1 ? '目录' : menu.type === 2 ? '菜单' : '按钮';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      return {
        code: 200,
        data: {
          roleId: superAdminRole.id,
          roleName: superAdminRole.name,
          totalMenus: allMenus.length,
          menusByType: menusByType,
          assignedMenuIds: menuIds,
        },
        msg: `成功为超级管理员分配 ${allMenus.length} 个菜单权限`,
      };
    } catch (error) {
      console.error('为超级管理员分配菜单权限失败:', error);
      return {
        code: 500,
        data: null,
        msg: `分配失败: ${error.message}`,
      };
    }
  }

  @Get('check-super-admin-menus')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '检查超级管理员的菜单权限' })
  @ApiResponse({ status: 200, description: '检查成功' })
  async checkSuperAdminMenus() {
    try {
      // 1. 查找超级管理员角色
      const superAdminRole = await this.roleRepository.findOne({
        where: { code: 'super_admin' },
      });

      if (!superAdminRole) {
        return {
          code: 404,
          data: null,
          msg: '超级管理员角色不存在',
        };
      }

      // 2. 查询超级管理员的菜单权限
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      const roleMenus = await queryRunner.query(
        `
        SELECT 
          rm.id as role_menu_id,
          rm.role_id,
          rm.menu_id,
          m.name as menu_name,
          m.title as menu_title,
          m.type as menu_type,
          m.status as menu_status,
          rm.created_at
        FROM role_menus rm
        LEFT JOIN menus m ON rm.menu_id = m.id
        WHERE rm.role_id = ?
        ORDER BY m.type, m.order_num, m.id
      `,
        [superAdminRole.id],
      );

      // 3. 统计菜单类型
      const menuStats = roleMenus.reduce(
        (acc, rm) => {
          const type =
            rm.menu_type === 1 ? '目录' : rm.menu_type === 2 ? '菜单' : '按钮';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // 4. 获取所有菜单总数进行对比
      const totalMenus = await this.menuRepository.count({
        where: { status: 1 },
      });

      await queryRunner.release();

      return {
        code: 200,
        data: {
          roleId: superAdminRole.id,
          roleName: superAdminRole.name,
          assignedMenusCount: roleMenus.length,
          totalMenusCount: totalMenus,
          isFullAccess: roleMenus.length === totalMenus,
          menuStats: menuStats,
          menus: roleMenus.map((rm) => ({
            menuId: rm.menu_id,
            menuName: rm.menu_name,
            menuTitle: rm.menu_title,
            menuType:
              rm.menu_type === 1
                ? '目录'
                : rm.menu_type === 2
                  ? '菜单'
                  : '按钮',
            status: rm.menu_status === 1 ? '启用' : '禁用',
            assignedAt: rm.created_at,
          })),
        },
        msg: '检查完成',
      };
    } catch (error) {
      console.error('检查超级管理员菜单权限失败:', error);
      return {
        code: 500,
        data: null,
        msg: `检查失败: ${error.message}`,
      };
    }
  }

  @Post('update-directory-menus-component')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '更新目录类型菜单的组件路径为BasicLayout' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateDirectoryMenusComponent() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();

      // 查找所有目录类型的菜单（type = 1）
      const directoryMenus = await queryRunner.query(`
        SELECT id, name, title, component, type 
        FROM menus 
        WHERE type = 1 AND status = 1
      `);

      if (directoryMenus.length === 0) {
        return {
          code: 200,
          data: { updated: 0 },
          msg: '没有找到需要更新的目录菜单',
        };
      }

      // 更新所有目录类型菜单的组件路径为 BasicLayout
      const updateResult = await queryRunner.query(`
        UPDATE menus 
        SET component = 'BasicLayout', updated_at = NOW() 
        WHERE type = 1 AND status = 1
      `);

      await queryRunner.release();

      return {
        code: 200,
        data: {
          updated: updateResult.affectedRows || directoryMenus.length,
          menus: directoryMenus.map((menu) => ({
            id: menu.id,
            name: menu.name,
            title: menu.title,
            oldComponent: menu.component,
            newComponent: 'BasicLayout',
          })),
        },
        msg: `成功更新 ${updateResult.affectedRows || directoryMenus.length} 个目录菜单的组件路径`,
      };
    } catch (error) {
      console.error('更新目录菜单组件路径失败:', error);
      return {
        code: 500,
        data: null,
        msg: `更新失败: ${error.message}`,
      };
    }
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import {
  OperationLog,
  ModuleNames,
  OperationTypes,
} from '../../operation-log/decorators/operation-log.decorator';
import { RoleMenuService } from '../../menus/services/role-menu.service';
import { MenusService } from '../../menus/services/menus.service';

@ApiTags('权限分配专用')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('role-permissions')
export class RolePermissionTreeController {
  constructor(
    private readonly menusService: MenusService,
    private readonly roleMenuService: RoleMenuService,
  ) {}

  @Get('menu-tree')
  @OperationLog({
    module: ModuleNames.ROLE,
    operation: OperationTypes.VIEW.operation,
    description: '获取菜单权限树（专用于角色权限分配）',
  })
  @ApiOperation({
    summary: '获取菜单权限树（专用于角色权限分配）',
    description: '返回标准的树形结构菜单数据，专用于前端权限分配组件',
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              label: { type: 'string' },
              value: { type: 'number' },
              children: { type: 'array' },
            },
          },
        },
        msg: { type: 'string' },
      },
    },
  })
  async getMenuTreeForPermissionAssign() {
    const menuTree = await this.menusService.getMenuTree();

    // 专门为权限分配格式化的函数
    const formatForPermissionTree = (menus: any[]): any[] => {
      return menus
        .filter((menu) => menu.status === 1) // 只返回启用的菜单
        .map((menu) => {
          const node: any = {
            id: menu.id,
            label: menu.title || menu.name,
            value: menu.id,
            key: String(menu.id),
            title: menu.title || menu.name,
            type: menu.type,
            icon: menu.icon,
            disabled: false, // 前端可以根据需要设置是否禁用
          };

          // 递归处理子菜单
          if (menu.children && menu.children.length > 0) {
            const children = formatForPermissionTree(menu.children);
            if (children.length > 0) {
              node.children = children;
            }
          }

          return node;
        });
    };

    const formattedTree = formatForPermissionTree(menuTree);

    return {
      code: 200,
      data: formattedTree,
      msg: '获取菜单权限树成功',
    };
  }

  @Get('role/:id/selected-menu-ids')
  @OperationLog({
    module: ModuleNames.ROLE,
    operation: OperationTypes.VIEW.operation,
    description: '获取角色已选中的菜单ID列表',
    businessIdField: 'id',
  })
  @ApiOperation({
    summary: '获取角色已选中的菜单ID列表',
    description: '获取指定角色已分配的菜单ID数组，用于前端权限树的回显',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getSelectedMenuIds(@Param('id', ParseIntPipe) roleId: number) {
    const menuIds = await this.roleMenuService.getRoleMenuIds(roleId);
    return {
      code: 200,
      data: menuIds,
      msg: '获取已选中菜单ID成功',
    };
  }

  @Post('role/:id/save-permissions')
  @OperationLog({
    module: ModuleNames.ROLE,
    operation: OperationTypes.ROLE_ASSIGN_PERMISSIONS.operation,
    description: '保存角色菜单权限',
    includeParams: true,
    businessIdField: 'id',
  })
  @ApiOperation({
    summary: '保存角色菜单权限',
    description: '保存角色的菜单权限分配',
  })
  @ApiResponse({ status: 200, description: '保存成功' })
  async saveRolePermissions(
    @Param('id', ParseIntPipe) roleId: number,
    @Body() body: { menuIds: number[] },
  ) {
    await this.roleMenuService.assignMenusToRole(roleId, body.menuIds);
    return {
      code: 200,
      data: null,
      msg: '权限保存成功',
    };
  }
}

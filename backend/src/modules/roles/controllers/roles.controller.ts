import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
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
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { QueryRoleDto } from '../dto/query-role.dto';
import { RoleMenuService } from '../../menus/services/role-menu.service';
import { MenusService } from '../../menus/services/menus.service';

@ApiTags('角色管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly roleMenuService: RoleMenuService,
    private readonly menusService: MenusService,
  ) {}

  @Get('all')
  @OperationLog({
    module: ModuleNames.ROLE,
    operation: OperationTypes.VIEW.operation,
    description: '获取所有角色列表',
  })
  @ApiOperation({ summary: '获取所有角色列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAllRoles() {
    const roles = await this.rolesService.findAll();
    return {
      code: 200,
      data: roles,
      msg: '获取成功',
    };
  }

  @Get()
  @OperationLog({
    module: ModuleNames.ROLE,
    operation: OperationTypes.VIEW.operation,
    description: '分页查询角色列表',
    includeParams: true,
  })
  @ApiOperation({ summary: '分页查询角色列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getRoles(@Query() query: QueryRoleDto) {
    const result = await this.rolesService.findWithPagination(query);
    return {
      code: 200,
      data: result,
      msg: '查询成功',
    };
  }

  @Get(':id')
  @OperationLog({
    module: ModuleNames.ROLE,
    operation: OperationTypes.VIEW.operation,
    description: '根据ID获取角色详情',
    businessIdField: 'id',
  })
  @ApiOperation({ summary: '根据ID获取角色详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRoleById(@Param('id', ParseIntPipe) id: number) {
    const role = await this.rolesService.findById(id);
    return {
      code: 200,
      data: role,
      msg: '获取成功',
    };
  }

  @Post()
  @OperationLog({
    module: ModuleNames.ROLE,
    operation: OperationTypes.ROLE_CREATE.operation,
    description: '创建角色',
    includeParams: true,
    includeResponse: true,
  })
  @ApiOperation({ summary: '创建角色' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.rolesService.create(createRoleDto);
    return {
      code: 201,
      data: role,
      msg: '创建成功',
    };
  }

  @Put(':id')
  @OperationLog({
    module: ModuleNames.ROLE,
    operation: OperationTypes.ROLE_UPDATE.operation,
    description: '更新角色',
    includeParams: true,
    includeResponse: true,
    businessIdField: 'id',
  })
  @ApiOperation({ summary: '更新角色' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const role = await this.rolesService.update(id, updateRoleDto);
    return {
      code: 200,
      data: role,
      msg: '更新成功',
    };
  }

  @Delete(':id')
  @OperationLog({
    module: ModuleNames.ROLE,
    operation: OperationTypes.ROLE_DELETE.operation,
    description: '删除角色',
    businessIdField: 'id',
  })
  @ApiOperation({ summary: '删除角色' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    await this.rolesService.delete(id);
    return {
      code: 200,
      data: null,
      msg: '删除成功',
    };
  }

  @Put(':id/toggle-status')
  @OperationLog({
    module: ModuleNames.ROLE,
    operation: 'change_status',
    description: '切换角色状态',
    businessIdField: 'id',
  })
  @ApiOperation({ summary: '切换角色状态' })
  @ApiResponse({ status: 200, description: '状态切换成功' })
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    const role = await this.rolesService.toggleStatus(id);
    return {
      code: 200,
      data: role,
      msg: '状态切换成功',
    };
  }

  // ==================== 菜单权限相关接口 ====================

  @Get('menu-tree')
  @OperationLog({
    module: ModuleNames.ROLE,
    operation: OperationTypes.VIEW.operation,
    description: '获取菜单树（供角色权限分配使用）',
  })
  @ApiOperation({
    summary: '获取菜单树（供角色权限分配使用）',
    description:
      '获取完整的菜单树形结构，用于角色权限分配界面，返回标准的树形结构',
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
              id: { type: 'number', example: 1 },
              label: { type: 'string', example: '系统管理' },
              value: { type: 'number', example: 1 },
              title: { type: 'string', example: '系统管理' },
              key: { type: 'string', example: '1' },
              children: {
                type: 'array',
                items: { type: 'object' },
              },
            },
          },
        },
        msg: { type: 'string', example: '获取菜单树成功' },
      },
    },
  })
  async getMenuTreeForRoleAssign() {
    const menuTree = await this.menusService.getMenuTree();

    // 转换为前端需要的标准树形结构
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatTreeForFrontend = (menus: any[]): any[] => {
      return menus.map((menu) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedMenu = {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          id: menu.id,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          label: menu.title || menu.name, // 显示文本
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          value: menu.id, // 选择的值
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          title: menu.title || menu.name, // 标题
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          key: String(menu.id), // 唯一key
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          type: menu.type, // 菜单类型：1=目录，2=菜单，3=按钮
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          icon: menu.icon, // 图标
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          path: menu.path, // 路径
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          component: menu.component, // 组件
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          status: menu.status, // 状态
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          orderNum: menu.orderNum || menu.sort || 0, // 排序
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          parentId: menu.parentId, // 父级ID
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          children:
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            menu.children && menu.children.length > 0
              ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                formatTreeForFrontend(menu.children)
              : undefined,
        };

        // 只保留有效的children
        if (formattedMenu.children && formattedMenu.children.length === 0) {
          delete formattedMenu.children;
        }

        return formattedMenu;
      });
    };

    const formattedTree = formatTreeForFrontend(menuTree);

    return {
      code: 200,
      data: formattedTree,
      msg: '获取菜单树成功',
    };
  }

  @Get(':id/menus')
  @OperationLog({
    module: ModuleNames.ROLE,
    operation: OperationTypes.VIEW.operation,
    description: '获取角色已分配的菜单权限',
    businessIdField: 'id',
  })
  @ApiOperation({
    summary: '获取角色已分配的菜单权限',
    description: '获取指定角色已分配的菜单权限列表',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRoleMenus(@Param('id', ParseIntPipe) roleId: number) {
    const menus = await this.roleMenuService.getRoleMenus(roleId);
    return {
      code: 200,
      data: menus,
      msg: '获取角色菜单权限成功',
    };
  }

  @Get(':id/menu-ids')
  @OperationLog({
    module: ModuleNames.ROLE,
    operation: OperationTypes.VIEW.operation,
    description: '获取角色已分配的菜单ID列表',
    businessIdField: 'id',
  })
  @ApiOperation({
    summary: '获取角色已分配的菜单ID列表',
    description: '获取指定角色已分配的菜单ID列表，用于前端复选框回显',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRoleMenuIds(@Param('id', ParseIntPipe) roleId: number) {
    const menuIds = await this.roleMenuService.getRoleMenuIds(roleId);
    return {
      code: 200,
      data: menuIds,
      msg: '获取角色菜单ID列表成功',
    };
  }

  @Post(':id/assign-menus')
  @OperationLog({
    module: ModuleNames.ROLE,
    operation: OperationTypes.ROLE_ASSIGN_PERMISSIONS.operation,
    description: '为角色分配菜单权限',
    includeParams: true,
    businessIdField: 'id',
  })
  @ApiOperation({
    summary: '为角色分配菜单权限',
    description: '为指定角色分配菜单权限，会覆盖原有的菜单权限',
  })
  @ApiResponse({ status: 200, description: '分配成功' })
  async assignMenusToRole(
    @Param('id', ParseIntPipe) roleId: number,
    @Body() body: { menuIds: number[] },
  ) {
    await this.roleMenuService.assignMenusToRole(roleId, body.menuIds);
    return {
      code: 200,
      data: null,
      msg: '菜单权限分配成功',
    };
  }
}

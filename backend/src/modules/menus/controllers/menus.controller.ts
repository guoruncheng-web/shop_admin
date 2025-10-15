import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MenusService } from '../services/menus.service';
import { CreateMenuDto } from '../dto/create-menu.dto';
import { UpdateMenuDto } from '../dto/update-menu.dto';
import { QueryMenuDto } from '../dto/query-menu.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import {
  OperationLog,
  ModuleNames,
  OperationTypes,
} from '../../operation-log/decorators/operation-log.decorator';
import { CurrentUser } from '../../../auth/decorators/current-user.decorator';

@ApiTags('菜单管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @OperationLog({
    module: ModuleNames.MENU,
    operation: OperationTypes.MENU_CREATE.operation,
    description: '创建菜单',
    includeParams: true,
    includeResponse: true,
  })
  @ApiOperation({ summary: '创建菜单', description: '创建新的菜单项' })
  @ApiResponse({
    status: 201,
    description: '创建成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            path: { type: 'string' },
            component: { type: 'string' },
            icon: { type: 'string' },
            sort: { type: 'number' },
            visible: { type: 'boolean' },
            external: { type: 'boolean' },
            cache: { type: 'boolean' },
            permission: { type: 'string' },
            type: { type: 'number' },
            status: { type: 'boolean' },
            createdAt: { type: 'string' },
            updatedAt: { type: 'string' },
          },
        },
        msg: { type: 'string', example: '创建成功' },
      },
    },
  })
  async create(@Body() createMenuDto: CreateMenuDto, @CurrentUser() user: any) {
    const menu = await this.menusService.create(createMenuDto, user);
    return {
      code: 200,
      data: menu,
      msg: '创建成功',
    };
  }

  @Get('tree')
  @OperationLog({
    module: ModuleNames.MENU,
    operation: OperationTypes.VIEW.operation,
    description: '查看菜单树',
    includeParams: true,
  })
  @ApiOperation({ summary: '获取菜单树', description: '获取菜单的树形结构' })
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
              name: { type: 'string' },
              path: { type: 'string' },
              component: { type: 'string' },
              icon: { type: 'string' },
              sort: { type: 'number' },
              visible: { type: 'boolean' },
              external: { type: 'boolean' },
              cache: { type: 'boolean' },
              permission: { type: 'string' },
              type: { type: 'number' },
              status: { type: 'boolean' },
              children: { type: 'array' },
            },
          },
        },
        msg: { type: 'string', example: '获取成功' },
      },
    },
  })
  async getMenuTree(@Query() query: QueryMenuDto) {
    const menus = await this.menusService.getMenuTree(query);
    return {
      code: 200,
      data: menus,
      msg: '获取成功',
    };
  }

  @Get()
  @OperationLog({
    module: ModuleNames.MENU,
    operation: OperationTypes.VIEW.operation,
    description: '查询菜单列表',
    includeParams: true,
  })
  @ApiOperation({
    summary: '查询菜单列表',
    description: '查询菜单列表，支持模糊查询',
  })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'array' },
        msg: { type: 'string', example: '查询成功' },
      },
    },
  })
  async getMenus(@Query() query: QueryMenuDto) {
    const menus = await this.menusService.getMenus(query);
    return {
      code: 200,
      data: menus,
      msg: '查询成功',
    };
  }

  @Get('user')
  @OperationLog({
    module: ModuleNames.MENU,
    operation: OperationTypes.VIEW.operation,
    description: '获取用户菜单',
  })
  @ApiOperation({
    summary: '获取用户菜单',
    description: '根据用户权限获取菜单',
  })
  @ApiQuery({
    name: 'permissions',
    description: '用户权限列表',
    required: false,
    type: [String],
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'array' },
        msg: { type: 'string', example: '获取成功' },
      },
    },
  })
  async getUserMenus() {
    const menus = await this.menusService.getUserMenusByUserId(1); // 临时使用用户ID 1
    return {
      code: 200,
      data: menus,
      msg: '获取成功',
    };
  }

  @Get('user/:userId')
  @OperationLog({
    module: ModuleNames.MENU,
    operation: OperationTypes.VIEW.operation,
    description: '根据用户ID获取菜单',
    businessIdField: 'userId',
  })
  @ApiOperation({
    summary: '根据用户ID获取菜单',
    description: '根据用户ID获取该用户角色对应的菜单列表',
  })
  @ApiParam({ name: 'userId', description: '用户ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'array' },
        msg: { type: 'string', example: '获取成功' },
      },
    },
  })
  async getUserMenusByUserId(@Param('userId') userId: string) {
    const menus = await this.menusService.getUserMenusByUserId(+userId);
    return {
      code: 200,
      data: menus,
      msg: '获取成功',
    };
  }

  @Get('user/:userId/buttons')
  @OperationLog({
    module: ModuleNames.MENU,
    operation: OperationTypes.VIEW.operation,
    description: '获取用户按钮权限',
    businessIdField: 'userId',
  })
  @ApiOperation({
    summary: '获取用户按钮权限',
    description: '根据用户ID获取该用户的按钮权限列表',
  })
  @ApiParam({ name: 'userId', description: '用户ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'array' },
        msg: { type: 'string', example: '获取成功' },
      },
    },
  })
  async getUserButtons(@Param('userId') userId: string) {
    const buttons = await this.menusService.getUserButtons(+userId);
    return {
      code: 200,
      data: buttons,
      msg: '获取成功',
    };
  }

  @Get(':id')
  @OperationLog({
    module: ModuleNames.MENU,
    operation: OperationTypes.VIEW.operation,
    description: '获取菜单详情',
    businessIdField: 'id',
  })
  @ApiOperation({
    summary: '获取菜单详情',
    description: '根据ID获取菜单详细信息',
  })
  @ApiParam({ name: 'id', description: '菜单ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'object' },
        msg: { type: 'string', example: '获取成功' },
      },
    },
  })
  async getMenuById(@Param('id') id: string) {
    const menu = await this.menusService.getMenuById(+id);
    return {
      code: 200,
      data: menu,
      msg: '获取成功',
    };
  }

  @Patch(':id')
  @OperationLog({
    module: ModuleNames.MENU,
    operation: OperationTypes.MENU_UPDATE.operation,
    description: '更新菜单',
    includeParams: true,
    includeResponse: true,
    businessIdField: 'id',
  })
  @ApiOperation({ summary: '更新菜单', description: '根据ID更新菜单信息' })
  @ApiParam({ name: 'id', description: '菜单ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'object' },
        msg: { type: 'string', example: '更新成功' },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateMenuDto: UpdateMenuDto,
    @CurrentUser() user: any,
  ) {
    const menu = await this.menusService.update(+id, updateMenuDto, user);
    return {
      code: 200,
      data: menu,
      msg: '更新成功',
    };
  }

  @Put(':id')
  @OperationLog({
    module: ModuleNames.MENU,
    operation: OperationTypes.MENU_UPDATE.operation,
    description: '更新菜单(PUT)',
    includeParams: true,
    includeResponse: true,
    businessIdField: 'id',
  })
  @ApiOperation({
    summary: '更新菜单 (PUT)',
    description: '根据ID更新菜单信息 (PUT方法)',
  })
  @ApiParam({ name: 'id', description: '菜单ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'object' },
        msg: { type: 'string', example: '更新成功' },
      },
    },
  })
  async updatePut(
    @Param('id') id: string,
    @Body() updateMenuDto: UpdateMenuDto,
    @CurrentUser() user: any,
  ) {
    const menu = await this.menusService.update(+id, updateMenuDto, user);
    return {
      code: 200,
      data: menu,
      msg: '更新成功',
    };
  }

  @Patch(':id/status')
  @OperationLog({
    module: ModuleNames.MENU,
    operation: OperationTypes.MENU_UPDATE.operation,
    description: '更新菜单状态',
    includeParams: true,
    includeResponse: true,
    businessIdField: 'id',
  })
  @ApiOperation({
    summary: '更新菜单状态 (PATCH)',
    description: '启用或禁用菜单',
  })
  @ApiParam({ name: 'id', description: '菜单ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'object' },
        msg: { type: 'string', example: '状态更新成功' },
      },
    },
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: boolean },
  ) {
    const menu = await this.menusService.updateStatus(+id, body.status);
    return {
      code: 200,
      data: menu,
      msg: '状态更新成功',
    };
  }

  @Put(':id/status')
  @OperationLog({
    module: ModuleNames.MENU,
    operation: OperationTypes.MENU_UPDATE.operation,
    description: '更新菜单状态(PUT)',
    includeParams: true,
    includeResponse: true,
    businessIdField: 'id',
  })
  @ApiOperation({
    summary: '更新菜单状态 (PUT)',
    description: '启用或禁用菜单',
  })
  @ApiParam({ name: 'id', description: '菜单ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'object' },
        msg: { type: 'string', example: '状态更新成功' },
      },
    },
  })
  async updateStatusPut(
    @Param('id') id: string,
    @Body() body: { status: boolean },
  ) {
    const menu = await this.menusService.updateStatus(+id, body.status);
    return {
      code: 200,
      data: menu,
      msg: '状态更新成功',
    };
  }

  @Patch(':id/sort')
  @OperationLog({
    module: ModuleNames.MENU,
    operation: OperationTypes.MENU_UPDATE.operation,
    description: '更新菜单排序',
    includeParams: true,
    includeResponse: true,
    businessIdField: 'id',
  })
  @ApiOperation({ summary: '更新菜单排序', description: '更新菜单的排序值' })
  @ApiParam({ name: 'id', description: '菜单ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'object' },
        msg: { type: 'string', example: '排序更新成功' },
      },
    },
  })
  async updateSort(@Param('id') id: string, @Body() body: { sort: number }) {
    const menu = await this.menusService.updateSort(+id, body.sort);
    return {
      code: 200,
      data: menu,
      msg: '排序更新成功',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @OperationLog({
    module: ModuleNames.MENU,
    operation: OperationTypes.MENU_DELETE.operation,
    description: '删除菜单',
    businessIdField: 'id',
  })
  @ApiOperation({ summary: '删除菜单', description: '根据ID删除菜单' })
  @ApiParam({ name: 'id', description: '菜单ID', type: 'number' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'object', example: {} },
        msg: { type: 'string', example: '删除成功' },
      },
    },
  })
  async delete(@Param('id') id: string) {
    await this.menusService.delete(+id);
    return {
      code: 200,
      data: {},
      msg: '删除成功',
    };
  }

  @Post('batch-delete')
  @HttpCode(HttpStatus.OK)
  @OperationLog({
    module: ModuleNames.MENU,
    operation: OperationTypes.MENU_DELETE.operation,
    description: '批量删除菜单',
    includeParams: true,
  })
  @ApiOperation({ summary: '批量删除菜单', description: '批量删除多个菜单' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'number', example: 200 },
        data: { type: 'object', example: {} },
        msg: { type: 'string', example: '批量删除成功' },
      },
    },
  })
  async batchDelete(@Body() body: { ids: number[] }) {
    await this.menusService.batchDelete(body.ids);
    return {
      code: 200,
      data: {},
      msg: '批量删除成功',
    };
  }
}

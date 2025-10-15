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
import { PermissionsService } from '../services/permissions.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { QueryPermissionDto } from '../dto/query-permission.dto';
import { AssignRolePermissionsDto } from '../dto/assign-role-permissions.dto';
import {
  OperationLog,
  ModuleNames,
  OperationTypes,
} from '../../operation-log/decorators/operation-log.decorator';

@ApiTags('权限管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('tree')
  @OperationLog({
    module: ModuleNames.PERMISSION,
    operation: OperationTypes.VIEW.operation,
    description: '获取权限树形结构',
  })
  @ApiOperation({ summary: '获取权限树形结构' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPermissionTree() {
    const tree = await this.permissionsService.getPermissionTree();
    return {
      code: 200,
      data: tree,
      msg: '获取成功',
    };
  }

  @Get()
  @OperationLog({
    module: ModuleNames.PERMISSION,
    operation: OperationTypes.VIEW.operation,
    description: '分页查询权限列表',
    includeParams: true,
  })
  @ApiOperation({ summary: '分页查询权限列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  async getPermissions(@Query() query: QueryPermissionDto) {
    const result = await this.permissionsService.findWithPagination(query);
    return {
      code: 200,
      data: result,
      msg: '查询成功',
    };
  }

  @Get(':id')
  @OperationLog({
    module: ModuleNames.PERMISSION,
    operation: OperationTypes.VIEW.operation,
    description: '根据ID获取权限详情',
    businessIdField: 'id',
  })
  @ApiOperation({ summary: '根据ID获取权限详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getPermissionById(@Param('id', ParseIntPipe) id: number) {
    const permission = await this.permissionsService.findById(id);
    return {
      code: 200,
      data: permission,
      msg: '获取成功',
    };
  }

  @Post()
  @OperationLog({
    module: ModuleNames.PERMISSION,
    operation: OperationTypes.PERMISSION_CREATE.operation,
    description: '创建权限',
    includeParams: true,
    includeResponse: true,
  })
  @ApiOperation({ summary: '创建权限' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    const permission =
      await this.permissionsService.create(createPermissionDto);
    return {
      code: 201,
      data: permission,
      msg: '创建成功',
    };
  }

  @Put(':id')
  @OperationLog({
    module: ModuleNames.PERMISSION,
    operation: OperationTypes.PERMISSION_UPDATE.operation,
    description: '更新权限',
    includeParams: true,
    includeResponse: true,
    businessIdField: 'id',
  })
  @ApiOperation({ summary: '更新权限' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    const permission = await this.permissionsService.update(
      id,
      updatePermissionDto,
    );
    return {
      code: 200,
      data: permission,
      msg: '更新成功',
    };
  }

  @Delete(':id')
  @OperationLog({
    module: ModuleNames.PERMISSION,
    operation: OperationTypes.PERMISSION_DELETE.operation,
    description: '删除权限',
    businessIdField: 'id',
  })
  @ApiOperation({ summary: '删除权限' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async deletePermission(@Param('id', ParseIntPipe) id: number) {
    await this.permissionsService.delete(id);
    return {
      code: 200,
      data: null,
      msg: '删除成功',
    };
  }
}

@ApiTags('角色权限管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolePermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get(':id/permissions')
  @OperationLog({
    module: ModuleNames.ROLE,
    operation: OperationTypes.VIEW.operation,
    description: '获取角色权限列表',
    businessIdField: 'id',
  })
  @ApiOperation({ summary: '获取角色权限列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRolePermissions(@Param('id', ParseIntPipe) roleId: number) {
    const permissions =
      await this.permissionsService.getRolePermissions(roleId);
    return {
      code: 200,
      data: permissions,
      msg: '获取成功',
    };
  }

  @Post(':id/permissions')
  @OperationLog({
    module: ModuleNames.ROLE,
    operation: OperationTypes.ROLE_ASSIGN_PERMISSIONS.operation,
    description: '分配角色权限',
    includeParams: true,
    businessIdField: 'id',
  })
  @ApiOperation({ summary: '分配角色权限' })
  @ApiResponse({ status: 200, description: '分配成功' })
  async assignRolePermissions(
    @Param('id', ParseIntPipe) roleId: number,
    @Body() assignDto: AssignRolePermissionsDto,
  ) {
    await this.permissionsService.assignRolePermissions(
      roleId,
      assignDto.permissionIds,
    );
    return {
      code: 200,
      data: null,
      msg: '权限分配成功',
    };
  }
}

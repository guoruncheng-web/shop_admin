import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RoleMenuService } from '../services/role-menu.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

class AssignMenusDto {
  menuIds: number[];
}

class CopyRoleMenusDto {
  fromRoleId: number;
  toRoleId: number;
}

@ApiTags('角色菜单管理')
@Controller('role-menus')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoleMenuController {
  constructor(private readonly roleMenuService: RoleMenuService) {}

  @Post(':roleId/assign')
  @ApiOperation({
    summary: '为角色分配菜单权限',
    description: '为指定角色分配菜单权限，会覆盖原有的菜单权限',
  })
  @ApiResponse({ status: 200, description: '分配成功' })
  @ApiResponse({ status: 404, description: '角色或菜单不存在' })
  async assignMenusToRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() assignMenusDto: AssignMenusDto,
  ) {
    await this.roleMenuService.assignMenusToRole(
      roleId,
      assignMenusDto.menuIds,
    );
    return {
      code: 200,
      data: {},
      msg: '菜单权限分配成功',
    };
  }

  @Get(':roleId/menus')
  @ApiOperation({
    summary: '获取角色的菜单权限',
    description: '获取指定角色拥有的所有菜单权限',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRoleMenus(@Param('roleId', ParseIntPipe) roleId: number) {
    const menus = await this.roleMenuService.getRoleMenus(roleId);
    return {
      code: 200,
      data: menus,
      msg: '获取成功',
    };
  }

  @Get(':roleId/menu-ids')
  @ApiOperation({
    summary: '获取角色的菜单ID列表',
    description: '获取指定角色拥有的所有菜单ID列表',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRoleMenuIds(@Param('roleId', ParseIntPipe) roleId: number) {
    const menuIds = await this.roleMenuService.getRoleMenuIds(roleId);
    return {
      code: 200,
      data: menuIds,
      msg: '获取成功',
    };
  }

  @Delete(':roleId/menus')
  @ApiOperation({
    summary: '移除角色的菜单权限',
    description: '移除指定角色的指定菜单权限',
  })
  @ApiResponse({ status: 200, description: '移除成功' })
  async removeMenusFromRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() removeMenusDto: AssignMenusDto,
  ) {
    await this.roleMenuService.removeMenusFromRole(
      roleId,
      removeMenusDto.menuIds,
    );
    return {
      code: 200,
      data: {},
      msg: '菜单权限移除成功',
    };
  }

  @Get('menu/:menuId/roles')
  @ApiOperation({
    summary: '获取菜单被哪些角色使用',
    description: '获取指定菜单被哪些角色拥有',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getMenuRoles(@Param('menuId', ParseIntPipe) menuId: number) {
    const roles = await this.roleMenuService.getMenuRoles(menuId);
    return {
      code: 200,
      data: roles,
      msg: '获取成功',
    };
  }

  @Post('copy')
  @ApiOperation({
    summary: '复制角色菜单权限',
    description: '将一个角色的菜单权限复制到另一个角色',
  })
  @ApiResponse({ status: 200, description: '复制成功' })
  async copyRoleMenus(@Body() copyDto: CopyRoleMenusDto) {
    await this.roleMenuService.copyRoleMenus(
      copyDto.fromRoleId,
      copyDto.toRoleId,
    );
    return {
      code: 200,
      data: {},
      msg: '菜单权限复制成功',
    };
  }

  @Get('assignments')
  @ApiOperation({
    summary: '获取所有角色的菜单分配情况',
    description: '获取系统中所有角色的菜单分配情况',
  })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAllRoleMenuAssignments() {
    const assignments = await this.roleMenuService.getAllRoleMenuAssignments();
    return {
      code: 200,
      data: assignments,
      msg: '获取成功',
    };
  }
}

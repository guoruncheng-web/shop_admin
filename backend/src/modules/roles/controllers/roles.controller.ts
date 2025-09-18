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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesService } from '../services/roles.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { QueryRoleDto } from '../dto/query-role.dto';

@ApiTags('角色管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('all')
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
}
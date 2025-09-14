import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
} from 'class-validator';

export enum MenuType {
  DIRECTORY = 1,
  MENU = 2,
  BUTTON = 3,
}

export class CreateMenuDto {
  @ApiProperty({ description: '菜单名称', example: '系统管理' })
  @IsString({ message: '菜单名称必须是字符串' })
  name: string;

  @ApiProperty({ description: '菜单路径', example: '/system', required: false })
  @IsOptional()
  @IsString({ message: '菜单路径必须是字符串' })
  path?: string;

  @ApiProperty({
    description: '组件路径',
    example: 'system/index',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '组件路径必须是字符串' })
  component?: string;

  @ApiProperty({ description: '菜单图标', example: 'system', required: false })
  @IsOptional()
  @IsString({ message: '菜单图标必须是字符串' })
  icon?: string;

  @ApiProperty({ description: '排序', example: 1, required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序必须是数字' })
  @Min(0, { message: '排序不能小于0' })
  sort?: number;

  @ApiProperty({ description: '排序（兼容字段）', example: 1, required: false })
  @IsOptional()
  @IsNumber({}, { message: '排序必须是数字' })
  @Min(0, { message: '排序不能小于0' })
  orderNum?: number;

  @ApiProperty({ description: '是否显示', example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否显示必须是布尔值' })
  visible?: boolean;

  @ApiProperty({ description: '是否外链', example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否外链必须是布尔值' })
  external?: boolean;

  @ApiProperty({ description: '是否缓存', example: false, required: false })
  @IsOptional()
  @IsBoolean({ message: '是否缓存必须是布尔值' })
  cache?: boolean;

  @ApiProperty({
    description: '权限标识',
    example: 'user:add',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '权限标识必须是字符串' })
  permission?: string;

  @ApiProperty({ description: '权限ID', example: 1, required: false })
  @IsOptional()
  @IsNumber({}, { message: '权限ID必须是数字' })
  permissionId?: number;

  @ApiProperty({
    description: '菜单类型：1目录，2菜单，3按钮',
    example: 1,
    enum: MenuType,
  })
  @IsEnum(MenuType, { message: '菜单类型必须是1、2或3' })
  type: MenuType;

  @ApiProperty({
    description: '按钮标识（用于前端控制显示隐藏）',
    example: 'user:add',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '按钮标识必须是字符串' })
  buttonKey?: string;

  @ApiProperty({
    description: '状态：true启用，false禁用',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: '状态必须是布尔值' })
  status?: boolean;

  @ApiProperty({ description: '父级菜单ID', example: 0, required: false })
  @IsOptional()
  @IsNumber({}, { message: '父级菜单ID必须是数字' })
  @Min(0, { message: '父级菜单ID不能小于0' })
  parentId?: number;

  // 前端额外字段（后端忽略）
  @ApiProperty({ description: '是否隐藏', required: false })
  @IsOptional()
  @IsBoolean({ message: '是否隐藏必须是布尔值' })
  isHidden?: boolean;

  @ApiProperty({ description: '是否缓存', required: false })
  @IsOptional()
  @IsBoolean({ message: '是否缓存必须是布尔值' })
  isKeepAlive?: boolean;

  @ApiProperty({ description: '是否固定', required: false })
  @IsOptional()
  @IsBoolean({ message: '是否固定必须是布尔值' })
  isAffix?: boolean;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;

  // 创建者和更新者信息（由系统自动填入）
  @ApiProperty({ description: '创建者用户ID', required: false })
  @IsOptional()
  @IsNumber({}, { message: '创建者用户ID必须是数字' })
  createdBy?: number;

  @ApiProperty({ description: '更新者用户ID', required: false })
  @IsOptional()
  @IsNumber({}, { message: '更新者用户ID必须是数字' })
  updatedBy?: number;

  @ApiProperty({ description: '创建者姓名', required: false })
  @IsOptional()
  @IsString({ message: '创建者姓名必须是字符串' })
  createdByName?: string;

  @ApiProperty({ description: '更新者姓名', required: false })
  @IsOptional()
  @IsString({ message: '更新者姓名必须是字符串' })
  updatedByName?: string;
}

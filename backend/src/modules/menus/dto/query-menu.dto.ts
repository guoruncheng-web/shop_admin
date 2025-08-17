import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { MenuType } from './create-menu.dto';

export class QueryMenuDto {
  @ApiProperty({ description: '菜单名称', required: false })
  @IsOptional()
  @IsString({ message: '菜单名称必须是字符串' })
  name?: string;

  @ApiProperty({ description: '菜单类型', required: false, enum: MenuType })
  @IsOptional()
  @IsEnum(MenuType, { message: '菜单类型必须是1、2或3' })
  type?: MenuType;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsBoolean({ message: '状态必须是布尔值' })
  status?: boolean;

  @ApiProperty({ description: '是否显示', required: false })
  @IsOptional()
  @IsBoolean({ message: '是否显示必须是布尔值' })
  visible?: boolean;

  @ApiProperty({ description: '页码', example: 1, required: false })
  @IsOptional()
  @IsNumber({}, { message: '页码必须是数字' })
  page?: number;

  @ApiProperty({ description: '每页数量', example: 10, required: false })
  @IsOptional()
  @IsNumber({}, { message: '每页数量必须是数字' })
  limit?: number;
}

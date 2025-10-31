import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  MaxLength,
  Min,
  IsIn,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: '父分类ID', example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  parentId?: number;

  @ApiProperty({ description: '分类名称', example: '服装' })
  @IsNotEmpty({ message: '分类名称不能为空' })
  @IsString()
  @MaxLength(100, { message: '分类名称最多100个字符' })
  categoryName: string;

  @ApiProperty({
    description: '分类编码',
    example: 'CLOTH_001',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  categoryCode?: string;

  @ApiProperty({
    description: '分类图标URL',
    example: 'https://example.com/icon.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  icon?: string;

  @ApiProperty({
    description: '分类图片URL',
    example: 'https://example.com/image.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;

  @ApiProperty({
    description: '分类横幅图',
    example: 'https://example.com/banner.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  banner?: string;

  @ApiProperty({ description: '分类描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '排序', example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sort?: number;

  @ApiProperty({
    description: '是否显示 0-否 1-是',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1], { message: '是否显示只能是0或1' })
  isShow?: number;

  @ApiProperty({
    description: '是否推荐 0-否 1-是',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1], { message: '是否推荐只能是0或1' })
  isRecommend?: number;

  @ApiProperty({ description: '模板ID', required: false })
  @IsOptional()
  @IsNumber()
  templateId?: number;

  @ApiProperty({
    description: '状态 0-禁用 1-启用',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1], { message: '状态只能是0或1' })
  status?: number;
}

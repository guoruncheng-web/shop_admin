import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCategoryDto {
  @ApiProperty({ description: '页码', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ description: '分类名称', required: false })
  @IsOptional()
  @IsString()
  categoryName?: string;

  @ApiProperty({ description: '分类编码', required: false })
  @IsOptional()
  @IsString()
  categoryCode?: string;

  @ApiProperty({ description: '父分类ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parentId?: number;

  @ApiProperty({ description: '分类层级', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([1, 2, 3], { message: '分类层级只能是1、2或3' })
  level?: number;

  @ApiProperty({
    description: '是否显示 0-否 1-是',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1])
  isShow?: number;

  @ApiProperty({
    description: '是否推荐 0-否 1-是',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1])
  isRecommend?: number;

  @ApiProperty({ description: '状态 0-禁用 1-启用', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1])
  status?: number;

  @ApiProperty({
    description: '商户ID（仅平台超级商户可用）',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  merchantId?: number;
}

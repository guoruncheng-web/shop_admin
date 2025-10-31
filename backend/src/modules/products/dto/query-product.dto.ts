import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductDto {
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

  @ApiProperty({ description: '商品名称', required: false })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ description: '商品编号', required: false })
  @IsOptional()
  @IsString()
  productNo?: string;

  @ApiProperty({ description: '品牌ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  brandId?: number;

  @ApiProperty({ description: '分类ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ description: '是否多规格', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1])
  hasSku?: number;

  @ApiProperty({ description: '商品状态', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1, 2])
  status?: number;

  @ApiProperty({ description: '是否热销', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1])
  isHot?: number;

  @ApiProperty({ description: '是否新品', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1])
  isNew?: number;

  @ApiProperty({ description: '是否推荐', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1])
  isRecommend?: number;

  @ApiProperty({ description: '是否折扣', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([0, 1])
  isDiscount?: number;

  @ApiProperty({
    description: '商户ID（仅平台超级商户可用）',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  merchantId?: number;
}

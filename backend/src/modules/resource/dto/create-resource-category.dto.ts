import { IsString, IsOptional, IsNumber, IsIn, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResourceCategoryDto {
  @ApiProperty({ description: '分类名称', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: '父分类ID', required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ description: '分类层级：1-一级分类，2-二级分类', enum: [1, 2] })
  @IsNumber()
  @IsIn([1, 2])
  level: number;

  @ApiProperty({ description: '排序字段', required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number = 0;

  @ApiProperty({ description: '状态：1-启用，0-禁用', enum: [0, 1], default: 1 })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  status?: number = 1;
}
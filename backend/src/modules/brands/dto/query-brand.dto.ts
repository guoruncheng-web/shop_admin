import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryBrandDto {
  @ApiProperty({
    description: '页码',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string, 10))
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string, 10))
  limit?: number = 10;

  @ApiProperty({
    description: '品牌名称搜索',
    example: 'Apple',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: '品牌状态',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string, 10))
  status?: number;

  @ApiProperty({
    description: '是否认证',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string, 10))
  isAuth?: number;

  @ApiProperty({
    description: '是否热门',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string, 10))
  isHot?: number;

  @ApiProperty({
    description: '标签搜索',
    example: 'news',
    required: false,
  })
  @IsOptional()
  @IsString()
  label?: string;
}

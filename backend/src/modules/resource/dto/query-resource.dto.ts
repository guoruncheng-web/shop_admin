import { IsOptional, IsString, IsNumber, IsEnum, IsArray, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ResourceType, ResourceStatus } from '../entities/resource.entity';

export class QueryResourceDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiProperty({ description: '资源名称搜索', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '资源类型', enum: ResourceType, required: false })
  @IsOptional()
  @IsEnum(ResourceType)
  type?: ResourceType;

  @ApiProperty({ description: '分类ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ description: '上传者ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  uploaderId?: number;

  @ApiProperty({ description: '状态', enum: ResourceStatus, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsEnum(ResourceStatus)
  status?: ResourceStatus;

  @ApiProperty({ description: '标签搜索', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: '排序字段', required: false, default: 'uploadedAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'uploadedAt';

  @ApiProperty({ description: '排序方向', required: false, default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
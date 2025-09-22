import { IsString, IsOptional, IsNumber, IsEnum, IsArray, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ResourceType } from '../entities/resource.entity';

export class CreateResourceDto {
  @ApiProperty({ description: '资源名称', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: '资源URL链接', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  url: string;

  @ApiProperty({ description: '资源类型', enum: ResourceType })
  @IsEnum(ResourceType)
  type: ResourceType;

  @ApiProperty({ description: '文件大小（字节）', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @ApiProperty({ description: '文件扩展名', required: false, maxLength: 10 })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  fileExtension?: string;

  @ApiProperty({ description: 'MIME类型', required: false, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  mimeType?: string;

  @ApiProperty({ description: '图片/视频宽度', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @ApiProperty({ description: '图片/视频高度', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiProperty({ description: '视频时长（秒）', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @ApiProperty({ description: '分类ID（必须是二级分类）' })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ description: '上传者ID' })
  @IsNumber()
  uploaderId: number;

  @ApiProperty({ description: '上传者姓名', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  uploaderName: string;

  @ApiProperty({ description: '资源描述', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '标签数组', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
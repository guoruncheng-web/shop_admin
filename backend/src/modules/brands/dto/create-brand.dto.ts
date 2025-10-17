import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '品牌名称',
    example: '苹果',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @ApiProperty({
    description: '品牌图标URL',
    example: 'https://example.com/icon.png',
  })
  iconUrl: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiProperty({
    description: '品牌标签',
    example: ['new', 'popular'],
  })
  label?: string[];

  @IsEnum([0, 1])
  @IsOptional()
  @ApiProperty({
    description: '是否热门品牌',
    example: 0,
    enum: [0, 1],
  })
  isHot?: number;
}

import { IsString, IsArray, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBrandDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: '品牌名称不能为空' })
  @ApiPropertyOptional({ description: '品牌名称' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: '品牌图标URL' })
  iconUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: '标签必须是字符串数组' })
  @ApiPropertyOptional({ description: '品牌标签', type: [String] })
  label?: string[];

  @IsOptional()
  @ApiPropertyOptional({ description: '品牌状态', enum: [0, 1] })
  status?: number;

  @IsOptional()
  @ApiPropertyOptional({ description: '认证状态', enum: [0, 1] })
  isAuth?: number;

  @IsOptional()
  @ApiPropertyOptional({ description: '热门品牌', enum: [0, 1] })
  isHot?: number;
}

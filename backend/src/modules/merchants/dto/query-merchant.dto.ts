import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMerchantDto {
  @ApiPropertyOptional({ description: '页码', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: '商户编码（模糊搜索）' })
  @IsOptional()
  @IsString()
  merchantCode?: string;

  @ApiPropertyOptional({ description: '商户名称（模糊搜索）' })
  @IsOptional()
  @IsString()
  merchantName?: string;

  @ApiPropertyOptional({
    description: '商户类型：1-超级商户，2-普通商户',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  merchantType?: number;

  @ApiPropertyOptional({
    description: '状态：0-禁用，1-启用，2-冻结',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;

  @ApiPropertyOptional({
    description: '认证状态：0-未认证，1-审核中，2-已认证，3-认证失败',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  certificationStatus?: number;

  @ApiPropertyOptional({ description: '联系电话' })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({ description: '联系邮箱' })
  @IsOptional()
  @IsString()
  contactEmail?: string;
}

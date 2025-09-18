import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryRoleDto {
  @ApiProperty({ description: '页码', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ description: '每页数量', example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize?: number;

  @ApiProperty({ description: '角色名称', example: '管理员', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: '角色代码', example: 'admin', required: false })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({ description: '状态：0-禁用，1-启用', example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;
}
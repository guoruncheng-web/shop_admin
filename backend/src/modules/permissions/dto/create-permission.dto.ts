import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ description: '权限名称', example: '用户管理' })
  @IsString()
  name: string;

  @ApiProperty({ description: '权限代码', example: 'system:user' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: '权限描述', example: '管理系统用户' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '状态：0-禁用，1-启用', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  status?: number;
}
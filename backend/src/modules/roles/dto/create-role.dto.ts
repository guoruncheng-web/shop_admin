import { IsString, IsOptional, IsNumber, IsArray, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: '管理员' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '角色代码', example: 'admin' })
  @IsString()
  @MaxLength(50)
  code: string;

  @ApiProperty({ description: '角色描述', example: '系统管理员角色', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @ApiProperty({ description: '状态：0-禁用，1-启用', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({ description: '权限ID列表', example: [1, 2, 3], required: false })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  permissionIds?: number[];
}
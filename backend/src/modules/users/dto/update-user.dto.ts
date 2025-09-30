import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEmail,
  IsNumber,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ description: '用户名', example: 'admin', required: false })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: '用户名至少3个字符' })
  @MaxLength(50, { message: '用户名最多50个字符' })
  username?: string;

  @ApiProperty({ description: '真实姓名', example: '张三', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '真实姓名最多50个字符' })
  realName?: string;

  @ApiProperty({
    description: '邮箱',
    example: 'admin@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiProperty({
    description: '手机号',
    example: '13800138000',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: '状态：0-禁用，1-启用',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({ description: '角色ID数组', example: [1, 2], required: false })
  @IsOptional()
  roleIds?: number[];
}

export class ChangePasswordDto {
  @ApiProperty({ description: '旧密码' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ description: '新密码' })
  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  newPassword: string;
}

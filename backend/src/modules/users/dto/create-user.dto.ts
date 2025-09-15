import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNumber, MinLength, MaxLength, IsPhoneNumber } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'admin' })
  @IsString()
  @MinLength(3, { message: '用户名至少3个字符' })
  @MaxLength(50, { message: '用户名最多50个字符' })
  username: string;

  @ApiProperty({ description: '密码', example: '123456' })
  @IsString()
  @MinLength(6, { message: '密码至少6个字符' })
  password: string;

  @ApiProperty({ description: '真实姓名', example: '张三' })
  @IsString()
  @MaxLength(50, { message: '真实姓名最多50个字符' })
  realName: string;

  @ApiProperty({ description: '邮箱', example: 'admin@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ description: '手机号', example: '13800138000', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: '状态：0-禁用，1-启用', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({ description: '角色ID数组', example: [1, 2], required: false })
  @IsOptional()
  roleIds?: number[];
}
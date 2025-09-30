import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: '用户名',
    example: 'admin',
  })
  @IsString({ message: '用户名必须是字符串' })
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiProperty({
    description: '密码',
    example: '123456',
  })
  @IsString({ message: '密码必须是字符串' })
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;

  @ApiProperty({
    description: '验证码',
    example: '1234',
  })
  @IsString({ message: '验证码必须是字符串' })
  @IsNotEmpty({ message: '验证码不能为空' })
  @Length(4, 6, { message: '验证码长度必须在4-6位之间' })
  captcha: string;

  @ApiProperty({
    description: '验证码ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString({ message: '验证码ID必须是字符串' })
  @IsNotEmpty({ message: '验证码ID不能为空' })
  captchaId: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: '状态码',
    example: 200,
  })
  code: number;

  @ApiProperty({
    description: '响应数据',
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: 1,
        username: 'admin',
        realName: '超级管理员',
        email: 'admin@example.com',
        phone: '13800138000',
        avatar: '/images/avatar/admin.png',
        roles: ['super_admin'],
        permissions: [
          'system:admin',
          'system:user',
          'product:list',
          'product:create',
        ],
        roleInfo: [
          {
            id: 1,
            name: '超级管理员',
            code: 'super_admin',
            description: '系统超级管理员，拥有所有权限',
          },
        ],
      },
    },
  })
  data: {
    accessToken: string;
    user: {
      id: number;
      username: string;
      realName: string;
      email?: string;
      phone?: string;
      avatar?: string;
      roles: string[];
      permissions: string[];
      roleInfo: Array<{
        id: number;
        name: string;
        code: string;
        description: string;
      }>;
    };
  };

  @ApiProperty({
    description: '响应消息',
    example: '登录成功',
  })
  msg: string;
}

export class CaptchaResponseDto {
  @ApiProperty({
    description: '验证码ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  captchaId: string;

  @ApiProperty({
    description: '验证码图片（base64格式）',
    example:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==',
  })
  captchaImage: string;

  @ApiProperty({
    description: '验证码有效期（秒）',
    example: 300,
  })
  expiresIn: number;
}

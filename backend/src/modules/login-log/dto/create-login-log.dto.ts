import { IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserLoginLogDto {
  @ApiProperty({ description: '用户ID' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'IP地址' })
  @IsString()
  ip: string;

  @ApiProperty({ description: '用户代理', required: false })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({ description: '登录地点', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: '登录状态', enum: ['success', 'failed'] })
  @IsEnum(['success', 'failed'])
  status: 'success' | 'failed';

  @ApiProperty({ description: '失败原因', required: false })
  @IsOptional()
  @IsString()
  failReason?: string;
}

export class QueryUserLoginLogDto {
  @ApiProperty({ description: '页码', required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ description: '每页数量', required: false, default: 20 })
  @IsOptional()
  pageSize?: number;

  @ApiProperty({ description: '登录状态', required: false, enum: ['success', 'failed', ''] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: '用户ID', required: false })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiProperty({ description: '用户名', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: 'IP地址', required: false })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiProperty({ description: '开始日期', required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ description: '结束日期', required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ description: '开始时间', required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ description: '结束时间', required: false })
  @IsOptional()
  @IsString()
  endTime?: string;
}
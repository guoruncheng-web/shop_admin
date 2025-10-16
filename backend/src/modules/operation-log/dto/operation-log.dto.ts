import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOperationLogDto {
  userId: number;
  username: string;
  module: string;
  operation: string;
  description: string;
  method: string;
  path: string;
  params?: string;
  response?: string;
  ip: string;
  location?: string;
  userAgent?: string;
  statusCode: number;
  executionTime: number;
  status: 'success' | 'failed';
  errorMessage?: string;
  businessId?: string;
  merchantId?: number;
}

export class QueryOperationLogDto {
  @ApiPropertyOptional({ description: '页码', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number = 20;

  @ApiPropertyOptional({ description: '用户名' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ description: '模块名称' })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({ description: '操作类型' })
  @IsOptional()
  @IsString()
  operation?: string;

  @ApiPropertyOptional({ description: '操作状态', enum: ['success', 'failed'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'IP地址' })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiPropertyOptional({ description: '开始时间' })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @ApiPropertyOptional({ description: '结束时间' })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @ApiPropertyOptional({ description: '业务标识' })
  @IsOptional()
  @IsString()
  businessId?: string;

  @ApiPropertyOptional({ description: '商户ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  merchantId?: number;

  @ApiPropertyOptional({ description: '商户名称' })
  @IsOptional()
  @IsString()
  merchantName?: string;
}

export class OperationLogResponseDto {
  id: number;
  userId: number;
  username: string;
  module: string;
  operation: string;
  description: string;
  method: string;
  path: string;
  params?: string;
  response?: string;
  ip: string;
  location?: string;
  userAgent?: string;
  statusCode: number;
  executionTime: number;
  status: 'success' | 'failed';
  errorMessage?: string;
  businessId?: string;
  createdAt: Date;
  merchantId?: number;
  merchant?: {
    id: number;
    merchantCode: string;
    merchantName: string;
    merchantType: number;
  };
  user?: {
    id: number;
    username: string;
    realName?: string;
    avatar?: string;
  };
}

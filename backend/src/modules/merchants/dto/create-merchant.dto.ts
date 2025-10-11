import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEmail,
  MaxLength,
  Min,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShippingAddressDto } from './shipping-address.dto';

export class CreateMerchantDto {
  @ApiProperty({ description: '商户编码（唯一标识）', example: 'MERCHANT_001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  merchantCode: string;

  @ApiProperty({ description: '商户名称', example: '测试商户' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  merchantName: string;

  @ApiPropertyOptional({
    description: '商户类型：1-超级商户（平台），2-普通商户',
    example: 2,
    default: 2,
  })
  @IsOptional()
  @IsNumber()
  merchantType?: number;

  @ApiPropertyOptional({ description: '法人代表', example: '张三' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  legalPerson?: string;

  @ApiPropertyOptional({
    description: '营业执照号',
    example: '91110000000000000X',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  businessLicense?: string;

  @ApiPropertyOptional({ description: '联系人姓名', example: '李四' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactName?: string;

  @ApiPropertyOptional({ description: '联系电话', example: '13800138000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;

  @ApiPropertyOptional({
    description: '联系邮箱',
    example: 'contact@merchant.com',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  contactEmail?: string;

  @ApiPropertyOptional({ description: '商户地址', example: '北京市朝阳区xxx' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ description: '商户Logo URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo?: string;

  @ApiPropertyOptional({ description: '商户描述', example: '这是一个测试商户' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '经营范围', example: '服装、鞋帽销售' })
  @IsOptional()
  @IsString()
  businessScope?: string;

  @ApiPropertyOptional({
    description: '经营类目ID数组',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  categoryIds?: number[];

  @ApiPropertyOptional({ description: '结算账户' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  settlementAccount?: string;

  @ApiPropertyOptional({ description: '结算银行', example: '中国工商银行' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  settlementBank?: string;

  @ApiPropertyOptional({
    description: '状态：0-禁用，1-启用，2-冻结',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiPropertyOptional({
    description: '最大商品数量',
    example: 1000,
    default: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxProducts?: number;

  @ApiPropertyOptional({
    description: '最大管理员数量',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxAdmins?: number;

  @ApiPropertyOptional({
    description: '最大存储空间(字节)，默认10GB',
    example: 10737418240,
    default: 10737418240,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStorage?: number;

  @ApiPropertyOptional({
    description: '平台抽成比例（%）',
    example: 5.0,
    default: 0.0,
  })
  @IsOptional()
  @IsNumber()
  commissionRate?: number;

  @ApiPropertyOptional({
    description: '商户配置JSON',
    example: { theme: 'default', enableNotification: true },
  })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Webhook回调地址' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  webhookUrl?: string;

  @ApiPropertyOptional({
    description: '发货地址',
    type: ShippingAddressDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress?: ShippingAddressDto;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  Matches,
} from 'class-validator';

export class ShippingAddressDto {
  @ApiProperty({ description: '联系人姓名', example: '张三' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  contactName: string;

  @ApiProperty({ description: '联系电话', example: '13800138000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(/^1[3-9]\d{9}$/, { message: '请输入正确的手机号码' })
  contactPhone: string;

  @ApiProperty({ description: '省份编码', example: '110000' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  provinceCode: string;

  @ApiProperty({ description: '省份名称', example: '北京市' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  provinceName: string;

  @ApiProperty({ description: '城市编码', example: '110100' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  cityCode: string;

  @ApiProperty({ description: '城市名称', example: '北京市' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  cityName: string;

  @ApiProperty({ description: '区/县编码', example: '110101' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  districtCode: string;

  @ApiProperty({ description: '区/县名称', example: '东城区' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  districtName: string;

  @ApiProperty({ description: '详细地址', example: 'xxx街道xxx号' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  detailAddress: string;

  @ApiPropertyOptional({ description: '邮政编码', example: '100000' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  postalCode?: string;
}

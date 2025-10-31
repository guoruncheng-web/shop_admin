import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateSkuDto {
  @ApiProperty({ description: '商品ID' })
  @IsNotEmpty({ message: '商品ID不能为空' })
  @IsNumber()
  productId: number;

  @ApiProperty({ description: 'SKU名称', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  skuName?: string;

  @ApiProperty({ description: '一级规格值ID', required: false })
  @IsOptional()
  @IsNumber()
  specValueId1?: number;

  @ApiProperty({ description: '二级规格值ID', required: false })
  @IsOptional()
  @IsNumber()
  specValueId2?: number;

  @ApiProperty({ description: '三级规格值ID', required: false })
  @IsOptional()
  @IsNumber()
  specValueId3?: number;

  @ApiProperty({ description: 'SKU主图', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: '原价', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiProperty({ description: '售价' })
  @IsNotEmpty({ message: '售价不能为空' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: '成本价', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiProperty({ description: '库存' })
  @IsNotEmpty({ message: '库存不能为空' })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ description: '预警库存', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  warningStock?: number;

  @ApiProperty({ description: '重量(kg)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({ description: '体积(m³)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume?: number;

  @ApiProperty({ description: '条形码', required: false })
  @IsOptional()
  @IsString()
  barcode?: string;
}

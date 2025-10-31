import {
  IsNotEmpty,
  IsInt,
  IsString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateProductSkuDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsString()
  @IsNotEmpty()
  skuCode: string;

  @IsInt()
  @IsOptional()
  specValueId1?: number;

  @IsInt()
  @IsOptional()
  specValueId2?: number;

  @IsInt()
  @IsOptional()
  specValueId3?: number;

  @IsString()
  @IsNotEmpty()
  specText: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  marketPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  stock: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  warningStock?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsNumber()
  @IsOptional()
  volume?: number;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsInt()
  @IsOptional()
  status?: number;
}

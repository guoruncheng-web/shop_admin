import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsIn,
  Min,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SkuSpecDto {
  @ApiProperty({ description: '规格名称', example: '颜色' })
  @IsNotEmpty()
  @IsString()
  specName: string;

  @ApiProperty({ description: '规格级别 1-一级 2-二级 3-三级', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @IsIn([1, 2, 3])
  specLevel: number;

  @ApiProperty({ description: '父规格ID', required: false })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiProperty({ description: '规格值列表', type: 'array' })
  @IsArray()
  specValues: {
    specValue: string;
    image?: string;
    colorHex?: string;
    extraPrice?: number;
    sort?: number;
  }[];
}

class SkuItemDto {
  @ApiProperty({ description: '一级规格值ID' })
  @IsOptional()
  @IsNumber()
  specValueId1?: number;

  @ApiProperty({ description: '二级规格值ID' })
  @IsOptional()
  @IsNumber()
  specValueId2?: number;

  @ApiProperty({ description: '三级规格值ID' })
  @IsOptional()
  @IsNumber()
  specValueId3?: number;

  @ApiProperty({ description: 'SKU名称' })
  @IsOptional()
  @IsString()
  skuName?: string;

  @ApiProperty({ description: 'SKU主图' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: '原价' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiProperty({ description: '售价' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: '成本价' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiProperty({ description: '库存' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ description: '预警库存' })
  @IsOptional()
  @IsNumber()
  warningStock?: number;

  @ApiProperty({ description: '条形码' })
  @IsOptional()
  @IsString()
  barcode?: string;
}

export class CreateProductDto {
  @ApiProperty({ description: '品牌ID', required: false })
  @IsOptional()
  @IsNumber()
  brandId?: number;

  @ApiProperty({ description: '分类ID' })
  @IsNotEmpty({ message: '分类ID不能为空' })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ description: '商品名称' })
  @IsNotEmpty({ message: '商品名称不能为空' })
  @IsString()
  @MaxLength(200)
  productName: string;

  @ApiProperty({ description: '副标题', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subtitle?: string;

  @ApiProperty({ description: '关键词', required: false })
  @IsOptional()
  @IsString()
  keywords?: string;

  @ApiProperty({ description: '商品主图', required: false })
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiProperty({ description: '商品图片列表', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty({ description: '商品视频', required: false })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiProperty({ description: '商品详情', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '市场价', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiProperty({ description: '是否多规格', example: 0 })
  @IsNotEmpty()
  @IsNumber()
  @IsIn([0, 1])
  hasSku: number;

  @ApiProperty({ description: '排序', required: false })
  @IsOptional()
  @IsNumber()
  sort?: number;

  @ApiProperty({ description: '是否热销', required: false })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  isHot?: number;

  @ApiProperty({ description: '是否新品', required: false })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  isNew?: number;

  @ApiProperty({ description: '是否推荐', required: false })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  isRecommend?: number;

  @ApiProperty({ description: '是否折扣', required: false })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  isDiscount?: number;

  @ApiProperty({ description: '服务保障', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  serviceGuarantee?: string[];

  @ApiProperty({ description: 'SKU规格定义（多规格商品必填）', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkuSpecDto)
  skuSpecs?: SkuSpecDto[];

  @ApiProperty({ description: 'SKU列表（多规格商品必填）', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkuItemDto)
  skus?: SkuItemDto[];

  @ApiProperty({ description: '单规格商品售价（单规格商品必填）', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ description: '单规格商品库存（单规格商品必填）', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiProperty({ description: '单规格商品成本价', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;
}

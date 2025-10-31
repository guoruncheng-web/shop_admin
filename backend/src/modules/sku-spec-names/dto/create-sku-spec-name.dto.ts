import { IsNotEmpty, IsInt, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateSkuSpecNameDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsString()
  @IsNotEmpty()
  specName: string;

  @IsInt()
  @Min(1)
  @Max(3)
  @IsNotEmpty()
  specLevel: number;

  @IsInt()
  @IsOptional()
  parentId?: number;

  @IsInt()
  @IsOptional()
  sort?: number;
}

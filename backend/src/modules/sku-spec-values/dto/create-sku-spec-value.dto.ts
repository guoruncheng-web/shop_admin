import { IsNotEmpty, IsInt, IsString, IsOptional } from 'class-validator';

export class CreateSkuSpecValueDto {
  @IsInt()
  @IsNotEmpty()
  specNameId: number;

  @IsString()
  @IsNotEmpty()
  specValue: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsInt()
  @IsOptional()
  sort?: number;
}

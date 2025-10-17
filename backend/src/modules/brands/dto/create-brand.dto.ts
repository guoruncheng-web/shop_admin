import { IsString, IsOptional, IsBoolean, IsArray, IsNotEmpty } from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsBoolean()
  @IsOptional()
  isAuth?: boolean;

  @IsBoolean()
  @IsOptional()
  isHot?: boolean;

  @IsArray()
  @IsOptional()
  label?: string[];
}

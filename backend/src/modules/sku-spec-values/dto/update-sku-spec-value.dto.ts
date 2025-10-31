import { PartialType } from '@nestjs/mapped-types';
import { CreateSkuSpecValueDto } from './create-sku-spec-value.dto';

export class UpdateSkuSpecValueDto extends PartialType(CreateSkuSpecValueDto) {}

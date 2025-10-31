import { PartialType } from '@nestjs/mapped-types';
import { CreateSkuSpecNameDto } from './create-sku-spec-name.dto';

export class UpdateSkuSpecNameDto extends PartialType(CreateSkuSpecNameDto) {}

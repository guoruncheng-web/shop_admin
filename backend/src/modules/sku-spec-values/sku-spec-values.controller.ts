import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { SkuSpecValuesService } from './sku-spec-values.service';
import { CreateSkuSpecValueDto } from './dto/create-sku-spec-value.dto';
import { UpdateSkuSpecValueDto } from './dto/update-sku-spec-value.dto';

@Controller('sku-spec-values')
export class SkuSpecValuesController {
  constructor(private readonly skuSpecValuesService: SkuSpecValuesService) {}

  @Post()
  create(@Body() createDto: CreateSkuSpecValueDto, @Req() req: any) {
    return this.skuSpecValuesService.create(createDto, req.user.merchantId);
  }

  @Get('spec-name/:specNameId')
  findBySpecName(@Param('specNameId') specNameId: string, @Req() req: any) {
    return this.skuSpecValuesService.findBySpecName(
      +specNameId,
      req.user.merchantId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.skuSpecValuesService.findOne(+id, req.user.merchantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSkuSpecValueDto,
    @Req() req: any,
  ) {
    return this.skuSpecValuesService.update(
      +id,
      updateDto,
      req.user.merchantId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.skuSpecValuesService.remove(+id, req.user.merchantId);
  }
}

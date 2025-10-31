import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { SkuSpecNamesService } from './sku-spec-names.service';
import { CreateSkuSpecNameDto } from './dto/create-sku-spec-name.dto';
import { UpdateSkuSpecNameDto } from './dto/update-sku-spec-name.dto';

@Controller('sku-spec-names')
export class SkuSpecNamesController {
  constructor(private readonly skuSpecNamesService: SkuSpecNamesService) {}

  @Post()
  create(@Body() createDto: CreateSkuSpecNameDto, @Req() req: any) {
    return this.skuSpecNamesService.create(createDto, req.user.merchantId);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string, @Req() req: any) {
    return this.skuSpecNamesService.findByProduct(+productId, req.user.merchantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.skuSpecNamesService.findOne(+id, req.user.merchantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSkuSpecNameDto,
    @Req() req: any,
  ) {
    return this.skuSpecNamesService.update(+id, updateDto, req.user.merchantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.skuSpecNamesService.remove(+id, req.user.merchantId);
  }
}

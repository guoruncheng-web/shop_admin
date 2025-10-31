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
import { ProductSkusService } from './product-skus.service';
import { CreateProductSkuDto } from './dto/create-product-sku.dto';
import { UpdateProductSkuDto } from './dto/update-product-sku.dto';

@Controller('product-skus')
export class ProductSkusController {
  constructor(private readonly productSkusService: ProductSkusService) {}

  @Post()
  create(@Body() createDto: CreateProductSkuDto, @Req() req: any) {
    return this.productSkusService.create(createDto, req.user.merchantId);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string, @Req() req: any) {
    return this.productSkusService.findByProduct(
      +productId,
      req.user.merchantId,
    );
  }

  @Get('code/:skuCode')
  findBySkuCode(@Param('skuCode') skuCode: string, @Req() req: any) {
    return this.productSkusService.findBySkuCode(skuCode, req.user.merchantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.productSkusService.findOne(+id, req.user.merchantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateProductSkuDto,
    @Req() req: any,
  ) {
    return this.productSkusService.update(+id, updateDto, req.user.merchantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.productSkusService.remove(+id, req.user.merchantId);
  }

  @Patch(':id/stock')
  updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
    @Req() req: any,
  ) {
    return this.productSkusService.updateStock(
      +id,
      quantity,
      req.user.merchantId,
    );
  }
}

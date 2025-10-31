import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSkusService } from './product-skus.service';
import { ProductSkusController } from './product-skus.controller';
import { ProductSku } from './entities/product-sku.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductSku])],
  controllers: [ProductSkusController],
  providers: [ProductSkusService],
  exports: [ProductSkusService],
})
export class ProductSkusModule {}

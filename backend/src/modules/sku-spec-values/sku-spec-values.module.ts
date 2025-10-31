import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkuSpecValuesService } from './sku-spec-values.service';
import { SkuSpecValuesController } from './sku-spec-values.controller';
import { SkuSpecValue } from './entities/sku-spec-value.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SkuSpecValue])],
  controllers: [SkuSpecValuesController],
  providers: [SkuSpecValuesService],
  exports: [SkuSpecValuesService],
})
export class SkuSpecValuesModule {}

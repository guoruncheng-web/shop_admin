import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkuSpecNamesService } from './sku-spec-names.service';
import { SkuSpecNamesController } from './sku-spec-names.controller';
import { SkuSpecName } from './entities/sku-spec-name.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SkuSpecName])],
  controllers: [SkuSpecNamesController],
  providers: [SkuSpecNamesService],
  exports: [SkuSpecNamesService],
})
export class SkuSpecNamesModule {}

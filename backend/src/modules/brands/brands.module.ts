import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { BrandsController } from './controllers/brands.controller';
import { BrandsService } from './services/brands.service';
import { OperationLogModule } from '../operation-log/operation-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Brand]), OperationLogModule],
  controllers: [BrandsController],
  providers: [BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}

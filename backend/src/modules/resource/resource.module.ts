import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceCategory } from './entities/resource-category.entity';
import { Resource } from './entities/resource.entity';
import { ResourceCategoryService } from './services/resource-category.service';
import { ResourceService } from './services/resource.service';
import { ResourceCategoryController } from './controllers/resource-category.controller';
import { ResourceController } from './controllers/resource.controller';
import { ResourceInitController } from './controllers/init.controller';
import { FixSchemaController } from './controllers/fix-schema.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResourceCategory, Resource])
  ],
  controllers: [
    ResourceCategoryController,
    ResourceController,
    ResourceInitController,
    FixSchemaController
  ],
  providers: [
    ResourceCategoryService,
    ResourceService
  ],
  exports: [
    ResourceCategoryService,
    ResourceService
  ]
})
export class ResourceModule {}
import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceCategory } from './entities/resource-category.entity';
import { Resource } from './entities/resource.entity';
import { ResourceCategoryService } from './services/resource-category.service';
import { ResourceService } from './services/resource.service';
import { ResourceCategoryController } from './controllers/resource-category.controller';
import { ResourceController } from './controllers/resource.controller';
import { ResourceInitController } from './controllers/init.controller';
import { FixSchemaController } from './controllers/fix-schema.controller';
import { ResourceMenuController } from './controllers/menu-init.controller';
import { Menu } from '../menus/entities/menu.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResourceCategory, Resource, Menu]),
    AuthModule,
  ],
  controllers: [
    ResourceCategoryController,
    ResourceController,
    ResourceInitController,
    FixSchemaController,
    ResourceMenuController,
  ],
  providers: [ResourceCategoryService, ResourceService],
  exports: [ResourceCategoryService, ResourceService],
})
export class ResourceModule {}

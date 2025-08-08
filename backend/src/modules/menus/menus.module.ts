import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenusService } from './services/menus.service';
import { MenusController } from './controllers/menus.controller';
import { Menu } from './entities/menu.entity';
import { Admin } from '../../database/entities/admin.entity';
import { Role } from '../../database/entities/role.entity';
import { Permission } from '../../database/entities/permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, Admin, Role, Permission])],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}

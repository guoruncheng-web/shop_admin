import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenusService } from './services/menus.service';
import { RoleMenuService } from './services/role-menu.service';
import { MenusController } from './controllers/menus.controller';
import { RoleMenuController } from './controllers/role-menu.controller';
import { Menu } from './entities/menu.entity';
import { Admin } from '../../database/entities/admin.entity';
import { Role } from '../../database/entities/role.entity';
import { Permission } from '../../database/entities/permission.entity';
import { RoleMenu } from '../../database/entities/role-menu.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu, Admin, Role, Permission, RoleMenu]),
  ],
  controllers: [MenusController, RoleMenuController],
  providers: [MenusService, RoleMenuService],
  exports: [MenusService, RoleMenuService],
})
export class MenusModule {}

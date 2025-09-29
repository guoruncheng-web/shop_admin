import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../database/entities/role.entity';
import { Permission } from '../../database/entities/permission.entity';
import { RoleMenu } from '../../database/entities/role-menu.entity';
import { Menu } from '../menus/entities/menu.entity';
import { Admin } from '../../database/entities/admin.entity';
import { RolesController } from './controllers/roles.controller';
import { RolePermissionTreeController } from './controllers/role-permission-tree.controller';
import { RolesService } from './services/roles.service';
import { RolePermissionsController } from '../permissions/controllers/permissions.controller';
import { PermissionsService } from '../permissions/services/permissions.service';
import { RoleMenuService } from '../menus/services/role-menu.service';
import { MenusService } from '../menus/services/menus.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RoleMenu, Menu, Admin])],
  controllers: [RolesController, RolePermissionTreeController, RolePermissionsController],
  providers: [RolesService, PermissionsService, RoleMenuService, MenusService],
  exports: [RolesService],
})
export class RolesModule {}
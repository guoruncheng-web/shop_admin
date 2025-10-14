import { Module, forwardRef } from '@nestjs/common';
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
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu, Admin, Role, Permission, RoleMenu]),
    forwardRef(() => AuthModule),
  ],
  controllers: [MenusController, RoleMenuController],
  providers: [MenusService, RoleMenuService],
  exports: [MenusService, RoleMenuService],
})
export class MenusModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../database/entities/role.entity';
import { Permission } from '../../database/entities/permission.entity';
import { RolesController } from './controllers/roles.controller';
import { RolesService } from './services/roles.service';
import { RolePermissionsController } from '../permissions/controllers/permissions.controller';
import { PermissionsService } from '../permissions/services/permissions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  controllers: [RolesController, RolePermissionsController],
  providers: [RolesService, PermissionsService],
  exports: [RolesService],
})
export class RolesModule {}
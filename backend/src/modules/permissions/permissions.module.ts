import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from '../../database/entities/permission.entity';
import { Role } from '../../database/entities/role.entity';
import { PermissionsController } from './controllers/permissions.controller';
import { MigrationController } from './controllers/migration.controller';
import { PermissionsService } from './services/permissions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role])],
  controllers: [PermissionsController, MigrationController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
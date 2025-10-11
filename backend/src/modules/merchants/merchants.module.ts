import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantsController } from './merchants.controller';
import { MerchantsService } from './merchants.service';
import { Merchant } from './entities/merchant.entity';
import { MerchantShippingAddress } from './entities/merchant-shipping-address.entity';
import { Admin } from '../../database/entities/admin.entity';
import { Role } from '../../database/entities/role.entity';
import { Permission } from '../../database/entities/permission.entity';
import { Menu } from '../menus/entities/menu.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Merchant,
      MerchantShippingAddress,
      Admin,
      Role,
      Permission,
      Menu,
    ]),
  ],
  controllers: [MerchantsController],
  providers: [MerchantsService],
  exports: [MerchantsService],
})
export class MerchantsModule {}

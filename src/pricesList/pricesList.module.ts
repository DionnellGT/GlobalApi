import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { PriceList } from './entities/price-list.entity';
import { Lot } from './entities/lot.entity';
import { PricesListController } from './pricesList.controller';
import { PricesListService } from './pricesList.service';

@Module({
  controllers: [PricesListController],
  providers: [PricesListService],
  imports: [
    TypeOrmModule.forFeature([PriceList, Lot]),
    AuthModule,
  ],
  exports: [PricesListService, TypeOrmModule],
})
export class PricesListModule {}

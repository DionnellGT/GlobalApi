import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SendLog }  from '../recipients/entities/send-log.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { TrackingService }    from './tracking.service';
import { TrackingController } from './tracking.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SendLog, Campaign])],
  controllers: [TrackingController],
  providers:   [TrackingService],
  exports:     [TrackingService],
})
export class TrackingModule {}

import { Module } from '@nestjs/common';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [CampaignsModule],
  controllers: [DashboardController],
})
export class DashboardModule {}

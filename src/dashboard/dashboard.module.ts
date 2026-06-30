import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [AuthModule, CampaignsModule],
  controllers: [DashboardController],
})
export class DashboardModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';
import { RecipientsModule } from '../recipients/recipients.module';
import { Campaign } from './entities/campaign.entity';
import { SendLog } from '../recipients/entities/send-log.entity';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, SendLog]),
    AuthModule,
    MailModule,
    RecipientsModule,
  ],
  controllers: [CampaignsController],
  providers:   [CampaignsService],
  exports:     [CampaignsService],
})
export class CampaignsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SendLog }   from '../recipients/entities/send-log.entity';
import { Recipient } from '../recipients/entities/recipient.entity';
import { Campaign }  from '../campaigns/entities/campaign.entity';
import { WebhooksService }    from './webhooks.service';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([SendLog, Recipient, Campaign])],
  controllers: [WebhooksController],
  providers:   [WebhooksService],
})
export class WebhooksModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../auth/auth.module';
import { Recipient } from './entities/recipient.entity';
import { SendLog } from './entities/send-log.entity';
import { RecipientsService } from './recipients.service';
import { RecipientsController } from './recipients.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Recipient, SendLog]),
    AuthModule,
  ],
  controllers: [RecipientsController],
  providers:   [RecipientsService],
  exports:     [RecipientsService, TypeOrmModule],
})
export class RecipientsModule {}

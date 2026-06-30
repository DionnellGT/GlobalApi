import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipient } from './entities/recipient.entity';
import { SendLog } from './entities/send-log.entity';
import { RecipientsService } from './recipients.service';
import { RecipientsController } from './recipients.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Recipient, SendLog])],
  controllers: [RecipientsController],
  providers: [RecipientsService],
  exports: [RecipientsService, TypeOrmModule],
})
export class RecipientsModule {}

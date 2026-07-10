import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SendLog, SendStatus } from '../recipients/entities/send-log.entity';
import { Recipient } from '../recipients/entities/recipient.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { ResendWebhookPayload } from './resend-webhook.types';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger('WebhooksService');

  constructor(
    @InjectRepository(SendLog)
    private readonly sendLogRepository: Repository<SendLog>,
    @InjectRepository(Recipient)
    private readonly recipientRepository: Repository<Recipient>,
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
  ) {}

  async handleResendEvent(payload: ResendWebhookPayload): Promise<void> {
    this.logger.log(`Evento Resend recibido: ${payload.type} — ${payload.data.email_id}`);
    switch (payload.type) {
      case 'email.bounced':   await this.handleBounce(payload);    break;
      case 'email.complained': await this.handleComplaint(payload); break;
      case 'email.delivered': await this.handleDelivered(payload);  break;
      default: this.logger.debug(`Evento ignorado: ${payload.type}`);
    }
  }

  private async handleBounce(payload: ResendWebhookPayload): Promise<void> {
    const { email_id, to, bounce } = payload.data;
    const email = to[0];
    const isHardBounce = bounce?.type === 'hard';

    const log = await this.sendLogRepository.findOne({
      where: { resendId: email_id },
      relations: ['campaign'],
    });

    if (log) {
      log.status = SendStatus.FAILED;
      log.error  = isHardBounce
        ? 'Hard bounce: dirección no existe'
        : 'Soft bounce: entrega temporal fallida';
      await this.sendLogRepository.save(log);

      if (log.campaign) {
        const campaign = await this.campaignRepository.findOne({ where: { id: log.campaign.id } });
        if (campaign && campaign.sentCount > 0) {
          campaign.sentCount   = Math.max(0, campaign.sentCount - 1);
          campaign.failedCount = campaign.failedCount + 1;
          await this.campaignRepository.save(campaign);
        }
      }
      this.logger.warn(`Bounce (${bounce?.type}) para ${email} — log actualizado`);
    }

    if (isHardBounce) {
      const recipient = await this.recipientRepository.findOne({ where: { email } });
      if (recipient) {
        recipient.isActive = false;
        await this.recipientRepository.save(recipient);
        this.logger.warn(`Destinatario ${email} marcado como inactivo (hard bounce)`);
      }
    }
  }

  private async handleComplaint(payload: ResendWebhookPayload): Promise<void> {
    const email = payload.data.to[0];
    const recipient = await this.recipientRepository.findOne({ where: { email } });
    if (recipient) {
      recipient.isActive = false;
      await this.recipientRepository.save(recipient);
      this.logger.warn(`Destinatario ${email} marcado como inactivo (spam complaint)`);
    }
  }

  private async handleDelivered(payload: ResendWebhookPayload): Promise<void> {
    this.logger.log(`Email entregado confirmado: ${payload.data.email_id}`);
  }
}

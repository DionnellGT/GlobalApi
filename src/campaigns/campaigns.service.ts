import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MailService } from '../mail/mail.service';
import { RecipientsService } from '../recipients/recipients.service';
import { SendLog, SendStatus } from '../recipients/entities/send-log.entity';
import { Campaign, CampaignStatus } from './entities/campaign.entity';
import { Template } from '../templates/entities/template.entity';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto';
import { SendCampaignDto } from '../recipients/dto/recipient.dto';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger('CampaignsService');

  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,

    @InjectRepository(SendLog)
    private readonly sendLogRepository: Repository<SendLog>,

    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,

    private readonly mailService: MailService,
    private readonly recipientsService: RecipientsService,
  ) {}

  async create(dto: CreateCampaignDto): Promise<Campaign> {
    const campaign = this.campaignRepository.create(dto);
    return this.campaignRepository.save(campaign);
  }

  async findAll(): Promise<Campaign[]> {
    return this.campaignRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignRepository.findOne({ where: { id } });
    if (!campaign) throw new NotFoundException(`Campaña ${id} no encontrada`);
    return campaign;
  }

  async update(id: string, dto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.findOne(id);
    if (campaign.status === CampaignStatus.SENDING)
      throw new BadRequestException('No puedes editar una campaña en proceso de envío');
    Object.assign(campaign, dto);
    return this.campaignRepository.save(campaign);
  }

  async remove(id: string): Promise<void> {
    const campaign = await this.findOne(id);
    await this.campaignRepository.remove(campaign);
  }

  async send(id: string, dto: SendCampaignDto): Promise<Campaign> {
    const campaign = await this.findOne(id);

    if (campaign.status === CampaignStatus.SENDING)
      throw new BadRequestException('Esta campaña ya está en proceso de envío');
    if (campaign.status === CampaignStatus.SENT)
      throw new BadRequestException('Esta campaña ya fue enviada. Crea una nueva para reenviar.');

    // Si la campaña tiene plantilla, usarla como base para subject/body
    // Los valores propios de la campaña tienen prioridad sobre la plantilla
    if (campaign.templateId) {
      const template = await this.templateRepository.findOne({
        where: { id: campaign.templateId },
      });
      if (template) {
        if (!campaign.subject) campaign.subject = template.subject;
        if (!campaign.body)    campaign.body    = template.body;
      }
    }

    const recipients = dto.recipientIds?.length
      ? await this.recipientsService.findByIds(dto.recipientIds)
      : await this.recipientsService.findAllActive();

    if (!recipients.length)
      throw new BadRequestException('No hay destinatarios activos para enviar la campaña');

    campaign.status          = CampaignStatus.SENDING;
    campaign.totalRecipients = recipients.length;
    campaign.sentCount       = 0;
    campaign.failedCount     = 0;
    await this.campaignRepository.save(campaign);

    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      const variables: Record<string, string> = {
        nombre:  recipient.name,
        email:   recipient.email,
        empresa: '',
        ciudad:  '',
      };

      const subject = this.mailService.interpolate(campaign.subject, variables);
      const body    = this.mailService.interpolate(campaign.body, variables);
      // Si el body ya es HTML (viene del editor Tiptap) lo usamos directo,
      // si es texto plano lo convertimos
      const html = body.trimStart().startsWith('<')
        ? body
        : this.mailService.textToHtml(body);

      const result = await this.mailService.sendEmail({ to: recipient.email, subject, html });

      const log = this.sendLogRepository.create({
        campaign,
        recipient,
        email:    recipient.email,
        status:   result.error ? SendStatus.FAILED : SendStatus.SENT,
        error:    result.error ?? null,
        resendId: result.id    ?? null,
      });
      await this.sendLogRepository.save(log);

      result.error ? failedCount++ : sentCount++;

      // delay 600ms para respetar rate limit de Resend
      await new Promise((r) => setTimeout(r, 600));
    }

    campaign.status      = CampaignStatus.SENT;
    campaign.sentCount   = sentCount;
    campaign.failedCount = failedCount;
    campaign.sentAt      = new Date();
    return this.campaignRepository.save(campaign);
  }

  async getLogs(id: string): Promise<SendLog[]> {
    await this.findOne(id);
    return this.sendLogRepository.find({
      where:     { campaign: { id } },
      relations: ['recipient'],
      order:     { sentAt: 'DESC' },
    });
  }

  async getDashboardMetrics() {
    const campaigns = await this.campaignRepository.find();
    const totalSent      = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
    const totalCampaigns = campaigns.length;
    const sentCampaigns  = campaigns.filter((c) => c.status === CampaignStatus.SENT);

    const avgDeliveryRate = sentCampaigns.length > 0
      ? Math.round(
          sentCampaigns.reduce(
            (acc, c) => acc + (c.totalRecipients > 0 ? (c.sentCount / c.totalRecipients) * 100 : 0),
            0,
          ) / sentCampaigns.length,
        )
      : 0;

    return {
      totalSent,
      totalCampaigns,
      avgOpenRate:     0,
      avgDeliveryRate,
      recentCampaigns: campaigns.slice(0, 5),
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SendLog } from '../recipients/entities/send-log.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';

// GIF transparente 1x1 en base64 — se devuelve al cliente de correo
const TRACKING_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
);

@Injectable()
export class TrackingService {
  private readonly logger = new Logger('TrackingService');

  constructor(
    @InjectRepository(SendLog)
    private readonly sendLogRepository: Repository<SendLog>,

    @InjectRepository(Campaign)
    private readonly campaignRepository: Repository<Campaign>,
  ) {}

  getTrackingPixel(): Buffer {
    return TRACKING_PIXEL;
  }

  async registerOpen(sendLogId: string): Promise<void> {
    try {
      const log = await this.sendLogRepository.findOne({
        where: { id: sendLogId },
        relations: ['campaign'],
      });

      if (!log) return;

      const isFirstOpen = !log.openedAt;

      // Incrementar contador de aperturas siempre
      log.openCount = (log.openCount ?? 0) + 1;

      // Primera apertura — registrar timestamp
      if (isFirstOpen) {
        log.openedAt = new Date();

        // Actualizar el contador de la campaña solo en la primera apertura
        if (log.campaign) {
          await this.campaignRepository.increment(
            { id: log.campaign.id },
            'openedCount',
            1,
          );
        }
      }

      await this.sendLogRepository.save(log);
      this.logger.debug(`Apertura registrada para log ${sendLogId} (total: ${log.openCount})`);
    } catch (err) {
      // No lanzar error — el tracking nunca debe romper la experiencia del usuario
      this.logger.error(`Error registrando apertura: ${err.message}`);
    }
  }

  async getOpenStats(campaignId: string): Promise<{
    sent: number;
    opened: number;
    openRate: number;
    logs: { email: string; openedAt: Date | null; openCount: number }[];
  }> {
    const logs = await this.sendLogRepository.find({
      where: { campaign: { id: campaignId } },
      select: ['email', 'openedAt', 'openCount', 'status'],
      order: { sentAt: 'DESC' },
    });

    const sent   = logs.length;
    const opened = logs.filter((l) => l.openedAt).length;

    return {
      sent,
      opened,
      openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
      logs: logs.map((l) => ({
        email:     l.email,
        openedAt:  l.openedAt,
        openCount: l.openCount,
      })),
    };
  }
}

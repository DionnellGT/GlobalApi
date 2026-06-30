import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { Recipient } from './entities/recipient.entity';
import {
  CreateRecipientDto,
  ImportRecipientsDto,
  UpdateRecipientDto,
} from './dto/recipient.dto';

@Injectable()
export class RecipientsService {
  private readonly logger = new Logger('RecipientsService');

  constructor(
    @InjectRepository(Recipient)
    private readonly recipientRepository: Repository<Recipient>,
  ) {}

  async create(dto: CreateRecipientDto, user: User): Promise<Recipient> {
    const exists = await this.recipientRepository.findOne({
      where: { email: dto.email, user: { id: user.id } },
    });
    if (exists) throw new BadRequestException(`El email ${dto.email} ya existe en tu lista`);

    const recipient = this.recipientRepository.create({ ...dto, user });
    return this.recipientRepository.save(recipient);
  }

  async import(dto: ImportRecipientsDto, user: User): Promise<{ imported: number; skipped: number }> {
    let imported = 0;
    let skipped  = 0;

    for (const item of dto.recipients) {
      const exists = await this.recipientRepository.findOne({
        where: { email: item.email, user: { id: user.id } },
      });
      if (exists) { skipped++; continue; }

      const recipient = this.recipientRepository.create({ ...item, user });
      await this.recipientRepository.save(recipient);
      imported++;
    }

    return { imported, skipped };
  }

  async findAll(user: User): Promise<Recipient[]> {
    return this.recipientRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User): Promise<Recipient> {
    const recipient = await this.recipientRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!recipient) throw new NotFoundException(`Destinatario ${id} no encontrado`);
    return recipient;
  }

  async update(id: string, dto: UpdateRecipientDto, user: User): Promise<Recipient> {
    const recipient = await this.findOne(id, user);
    Object.assign(recipient, dto);
    return this.recipientRepository.save(recipient);
  }

  async remove(id: string, user: User): Promise<void> {
    const recipient = await this.findOne(id, user);
    await this.recipientRepository.remove(recipient);
  }

  /** Devuelve todos los activos del usuario (para envío masivo) */
  async findAllActive(user: User): Promise<Recipient[]> {
    return this.recipientRepository.find({
      where: { user: { id: user.id }, isActive: true },
    });
  }

  /** Devuelve los activos filtrados por IDs */
  async findByIds(ids: string[], user: User): Promise<Recipient[]> {
    return this.recipientRepository
      .createQueryBuilder('r')
      .where('r.id IN (:...ids)', { ids })
      .andWhere('r.userId = :userId', { userId: user.id })
      .andWhere('r.isActive = true')
      .getMany();
  }
}

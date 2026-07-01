import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

  async create(dto: CreateRecipientDto): Promise<Recipient> {
    const exists = await this.recipientRepository.findOne({
      where: { email: dto.email },
    });
    if (exists) throw new BadRequestException(`El email ${dto.email} ya existe en la lista`);
    const recipient = this.recipientRepository.create(dto);
    return this.recipientRepository.save(recipient);
  }

  async import(dto: ImportRecipientsDto): Promise<{ imported: number; skipped: number }> {
    let imported = 0;
    let skipped  = 0;
    for (const item of dto.recipients) {
      const exists = await this.recipientRepository.findOne({ where: { email: item.email } });
      if (exists) { skipped++; continue; }
      await this.recipientRepository.save(this.recipientRepository.create(item));
      imported++;
    }
    return { imported, skipped };
  }

  async findAll(): Promise<Recipient[]> {
    return this.recipientRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Recipient> {
    const recipient = await this.recipientRepository.findOne({ where: { id } });
    if (!recipient) throw new NotFoundException(`Destinatario ${id} no encontrado`);
    return recipient;
  }

  async update(id: string, dto: UpdateRecipientDto): Promise<Recipient> {
    const recipient = await this.findOne(id);
    Object.assign(recipient, dto);
    return this.recipientRepository.save(recipient);
  }

  async remove(id: string): Promise<void> {
    const recipient = await this.findOne(id);
    await this.recipientRepository.remove(recipient);
  }

  async removeAll(): Promise<{ deleted: number }> {
    const count = await this.recipientRepository.count();
    await this.recipientRepository.delete({});
    return { deleted: count };
  }

  async findAllActive(): Promise<Recipient[]> {
    return this.recipientRepository.find({ where: { isActive: true } });
  }

  async findByIds(ids: string[]): Promise<Recipient[]> {
    return this.recipientRepository
      .createQueryBuilder('r')
      .where('r.id IN (:...ids)', { ids })
      .andWhere('r.isActive = true')
      .getMany();
  }
}

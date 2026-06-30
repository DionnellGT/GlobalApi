import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { Template } from './entities/template.entity';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger('TemplatesService');

  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  async create(dto: CreateTemplateDto, user: User): Promise<Template> {
    const template = this.templateRepository.create({ ...dto, user });
    return this.templateRepository.save(template);
  }

  async findAll(user: User): Promise<Template[]> {
    return this.templateRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User): Promise<Template> {
    const template = await this.templateRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!template) throw new NotFoundException(`Plantilla ${id} no encontrada`);
    return template;
  }

  async update(id: string, dto: UpdateTemplateDto, user: User): Promise<Template> {
    const template = await this.findOne(id, user);
    Object.assign(template, dto);
    return this.templateRepository.save(template);
  }

  async remove(id: string, user: User): Promise<void> {
    const template = await this.findOne(id, user);
    await this.templateRepository.remove(template);
  }
}

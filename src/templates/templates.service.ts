import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from './entities/template.entity';
import { CreateTemplateDto, UpdateTemplateDto } from './dto/template.dto';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  async create(dto: CreateTemplateDto): Promise<Template> {
    const template = this.templateRepository.create(dto);
    return this.templateRepository.save(template);
  }

  async findAll(): Promise<Template[]> {
    return this.templateRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Template> {
    const template = await this.templateRepository.findOne({ where: { id } });
    if (!template) throw new NotFoundException(`Plantilla ${id} no encontrada`);
    return template;
  }

  async update(id: string, dto: UpdateTemplateDto): Promise<Template> {
    const template = await this.findOne(id);
    Object.assign(template, dto);
    return this.templateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.templateRepository.remove(template);
  }
}

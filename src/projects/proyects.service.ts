import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { validate as isUUID } from 'uuid';
import { Project } from './entities';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger('ProjectsService');

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: User) {
    try {
      const project = this.projectRepository.create({
        ...createProjectDto,
        user,
      });
      await this.projectRepository.save(project);
      return project;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 12, offset = 0, q: query } = paginationDto;

    const [projects, total] = await this.projectRepository.findAndCount({
      take: limit,
      skip: offset,
      order: { name: 'ASC' },
      where: query ? { name: ILike(`%${query}%`) } : undefined,
    });

    return {
      count: total,
      pages: Math.ceil(total / limit),
      projects,
    };
  }

  async findOne(term: string) {
    let project: Project;

    if (isUUID(term)) {
      project = await this.projectRepository.findOneBy({ id: term });
    } else {
      project = await this.projectRepository
        .createQueryBuilder('p')
        .where('p.idSlug = :slug OR UPPER(p.name) = :name', {
          slug: term.toLowerCase(),
          name: term.toUpperCase(),
        })
        .getOne();
    }

    if (!project)
      throw new NotFoundException(`Project with term "${term}" not found`);

    return project;
  }

  async findOnePlain(term: string) {
    const project = await this.findOne(term);
    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user: User) {
    const project = await this.projectRepository.preload({ id, ...updateProjectDto });

    if (!project)
      throw new NotFoundException(`Project with id: ${id} not found`);

    project.user = user;

    try {
      await this.projectRepository.save(project);
      return project;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
  }

  async deleteAllProjects() {
    try {
      return await this.projectRepository.createQueryBuilder('project')
        .delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
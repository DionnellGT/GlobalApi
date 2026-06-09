import {
  BadRequestException, Injectable, InternalServerErrorException,
  Logger, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { validate as isUUID } from 'uuid';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Project } from './entities/project.entity';
import { CentroUrbano } from './entities/centro-urbano.entity';
import { AtraccionTuristica } from './entities/atraccion-turistica.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger('ProjectsService');

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(CentroUrbano)
    private readonly centroUrbanoRepository: Repository<CentroUrbano>,

    @InjectRepository(AtraccionTuristica)
    private readonly atraccionRepository: Repository<AtraccionTuristica>,

    private readonly dataSource: DataSource,
  ) {}

 async create(createProjectDto: CreateProjectDto, user: User) {
  const { centrosUrbanosCercanos = [], atraccionesTuristicas = [], ...projectData } = createProjectDto;

  // Validar orden único por marca si se envían ambos campos
  if (projectData.orden !== undefined && projectData.marca) {
    const existe = await this.projectRepository.findOne({
      where: { orden: projectData.orden, marca: projectData.marca },
    });
    if (existe) {
      throw new BadRequestException(
        `Ya existe un proyecto con orden ${projectData.orden} para la marca "${projectData.marca}"`
      );
    }
  }

  try {
      const project = this.projectRepository.create({
        ...projectData,
        user,
      });

      // Guardar el proyecto primero para tener el id
      await this.projectRepository.save(project);

      // Luego asignar las relaciones con el project ya persistido
      project.centrosUrbanosCercanos = centrosUrbanosCercanos.map(c =>
        this.centroUrbanoRepository.create({ ...c, project })
      );
      project.atraccionesTuristicas = atraccionesTuristicas.map(a =>
        this.atraccionRepository.create({ ...a, project })
      );

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
      order: { orden: 'ASC', name: 'ASC' },
      where: query ? { name: ILike(`%${query}%`) } : undefined,
      relations: { centrosUrbanosCercanos: true, atraccionesTuristicas: true },
    });

    return { count: total, pages: Math.ceil(total / limit), projects };
  }

  async findOne(term: string) {
    let project: Project;

    if (isUUID(term)) {
      project = await this.projectRepository.findOne({
        where: { id: term },
        relations: { centrosUrbanosCercanos: true, atraccionesTuristicas: true },
      });
    } else {
      project = await this.projectRepository
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.centrosUrbanosCercanos', 'centros')
        .leftJoinAndSelect('p.atraccionesTuristicas', 'atracciones')
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
    return this.findOne(term);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user: User) {
    const { centrosUrbanosCercanos, atraccionesTuristicas, ...projectData } = updateProjectDto;

    // Validar orden único por marca excluyendo el proyecto actual
    if (projectData.orden !== undefined && projectData.marca) {
      const existe = await this.projectRepository.findOne({
        where: { orden: projectData.orden, marca: projectData.marca },
      });
      if (existe && existe.id !== id) {
        throw new BadRequestException(
          `Ya existe un proyecto con orden ${projectData.orden} para la marca "${projectData.marca}"`
        );
      }
    }


    const project = await this.findOne(id);

    // Usar QueryRunner para hacerlo en una transacción
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Borrar los registros viejos si vienen nuevos en el body
      if (centrosUrbanosCercanos) {
        await queryRunner.manager.delete(CentroUrbano, { project: { id } });
        project.centrosUrbanosCercanos = centrosUrbanosCercanos.map(c =>
          this.centroUrbanoRepository.create({ ...c, project })
        );
      }

      if (atraccionesTuristicas) {
        await queryRunner.manager.delete(AtraccionTuristica, { project: { id } });
        project.atraccionesTuristicas = atraccionesTuristicas.map(a =>
          this.atraccionRepository.create({ ...a, project })
        );
      }

      Object.assign(project, projectData);
      project.user = user;

      await queryRunner.manager.save(project);
      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  // Método específico para actualizar solo imágenes, sin tocar relaciones ni user
  async updateImages(id: string, updateDto: UpdateProjectDto) {
    await this.projectRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
  }

  async deleteAllProjects() {
    try {
      return await this.projectRepository
        .createQueryBuilder('project')
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
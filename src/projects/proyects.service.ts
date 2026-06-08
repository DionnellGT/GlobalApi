import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ArrayContains,
  Between,
  DataSource,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { validate as isUUID } from 'uuid';
import { ProjectImage, Project } from './entities';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger('ProjectsService');

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,

    @InjectRepository(ProjectImage)
    private readonly projectImageRepository: Repository<ProjectImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: User) {
    try {
      const { images = [], ...ProjectDetails } = createProjectDto;

      const Project = this.projectRepository.create({
        ...ProjectDetails,
        images: images.map((image) =>
          this.projectImageRepository.create({ url: image }),
        ),
        user,
      });

      await this.projectRepository.save(Project);

      return { ...Project, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const {
      limit = 12,
      offset = 0,
      gender = '',
      minPrice,
      maxPrice,
      sizes,
      q: query,
    } = paginationDto;

    const sizesArray = sizes ? sizes.toUpperCase().split(',') : undefined;

    const priceWhere =
      minPrice !== undefined && maxPrice !== undefined
        ? Between(minPrice, maxPrice)
        : minPrice !== undefined
        ? MoreThanOrEqual(minPrice)
        : maxPrice !== undefined
        ? LessThanOrEqual(maxPrice)
        : undefined;

    const Projects = await this.projectRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
      order: {
        id: 'ASC',
      },
      where: {
        gender: gender ? gender : undefined,
        price: priceWhere,
        sizes: sizesArray ? ArrayContains(sizesArray) : undefined,
        title: query ? ILike(`%${query}%`) : undefined,
      },
    });

    const totalProjects = await this.projectRepository.count({
      where: {
        gender: gender ? gender : undefined,
        price: priceWhere,
        sizes: sizesArray ? ArrayContains(sizesArray) : undefined,
        title: query ? ILike(`%${query}%`) : undefined,
      },
    });
 
    return {
      count: totalProjects,
      pages: Math.ceil(totalProjects / limit),
      Projects: Projects.map((Project) => ({
        ...Project,
        images: Project.images.map((img) => img.url),
      })),
    };
  }

  async findOne(term: string) {
    let Project: Project;

    if (isUUID(term)) {
      Project = await this.projectRepository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.projectRepository.createQueryBuilder('prod');
      Project = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!Project) throw new NotFoundException(`Project with ${term} not found`);

    return Project;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user: User) {
    const { images, ...toUpdate } = updateProjectDto;

    const Project = await this.projectRepository.preload({ id, ...toUpdate });

    if (!Project)
      throw new NotFoundException(`Project with id: ${id} not found`);

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ProjectImage, { Project: { id } });

        Project.images = images.map((image) =>
          this.projectImageRepository.create({ url: image }),
        );
      }

      // await this.projectRepository.save( Project );
      Project.user = user;

      await queryRunner.manager.save(Project);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const Project = await this.findOne(id);
    await this.projectRepository.remove(Project);
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    // console.log(error)
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }

  async deleteAllProjects() {
    const query = this.projectRepository.createQueryBuilder('Project');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}


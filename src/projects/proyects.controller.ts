import {
  Controller, Get, Post, Body, Patch, Param,
  Delete, ParseUUIDPipe, Query,
  UseInterceptors, UploadedFiles, BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import * as fs from 'fs';

import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';
import { ProjectsService } from './proyects.service';
import { ConfigService } from '@nestjs/config';
import { fileFilter, fileNamer } from '../files/helpers';

@ApiTags('Project')
@Controller('Project')
export class ProjectsController {
  constructor(
    private readonly ProjectsService: ProjectsService,
    private readonly configService: ConfigService,
  ) {}

  @Post()
  @Auth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageCarrousel',              maxCount: 1  },
        { name: 'imagenBannerPrincipal',        maxCount: 1  },
        { name: 'imagenBannerPrincipalMobile',  maxCount: 1  },
        { name: 'imagenBaner2',                 maxCount: 1  },
        { name: 'imagenMapaFondo',              maxCount: 1  },
        { name: 'imagenCentrosUrbanos',         maxCount: 1  },
        { name: 'imagenAtraccionesTuristicas',  maxCount: 1  },
        { name: 'imagenesDeCaracteristicas',    maxCount: 10 },
        { name: 'imagenesVistasProyecto',       maxCount: 10 },
      ],
      {
        fileFilter,
        // Sin storage aún — usamos memoryStorage temporalmente
        // porque aún no tenemos el slug del proyecto
        storage: undefined,
      },
    ),
  )
  async create(
    @Body() body: any,
    @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] },
    @GetUser() user: User,
  ) {
    const hostApi = this.configService.get('HOST_API');

    // Parsear campos JSON que vienen como string en form-data
    const parseField = (field: any) => {
      if (!field) return undefined;
      try { return JSON.parse(field); } catch { return field; }
    };

    // Construir el DTO con los datos de texto
    const createProjectDto: CreateProjectDto = {
      name:                        body.name,
      idSlug:                      body.idSlug,
      marca:                       body.marca,
      orden:                       body.orden ? parseInt(body.orden) : undefined,
      isActive:                    body.isActive !== undefined ? body.isActive === 'true' : undefined,
      linkMapa:                    body.linkMapa,
      vistaProyecto360:            body.vistaProyecto360,
      centrosUrbanosCercanos:      parseField(body.centrosUrbanosCercanos),
      atraccionesTuristicas:       parseField(body.atraccionesTuristicas),
    };

    // 1. Crear el proyecto en BD sin imágenes
    const project = await this.ProjectsService.create(createProjectDto, user);

    // 2. Crear la carpeta usando el slug generado
    const folderName = project.idSlug;
    const folderPath = `./static/projects/${folderName}`;
    fs.mkdirSync(folderPath, { recursive: true });

    // 3. Helper para guardar un archivo y devolver su URL
    const saveFile = (file: Express.Multer.File): string => {
      const ext = file.mimetype.split('/')[1];
      const fileName = `${require('uuid').v4()}.${ext}`;
      fs.writeFileSync(`${folderPath}/${fileName}`, file.buffer);
      return `${hostApi}/files/project/${folderName}/${fileName}`;
    };

    // 4. Construir el DTO de actualización con las URLs de las imágenes
    const updateImagenesDto: UpdateProjectDto = {};

    if (files?.imageCarrousel?.[0])
      updateImagenesDto.imageCarrousel = saveFile(files.imageCarrousel[0]);

    if (files?.imagenBannerPrincipal?.[0])
      updateImagenesDto.imagenBannerPrincipal = saveFile(files.imagenBannerPrincipal[0]);

    if (files?.imagenBannerPrincipalMobile?.[0])
      updateImagenesDto.imagenBannerPrincipalMobile = saveFile(files.imagenBannerPrincipalMobile[0]);

    if (files?.imagenBaner2?.[0])
      updateImagenesDto.imagenBaner2 = saveFile(files.imagenBaner2[0]);

    if (files?.imagenMapaFondo?.[0])
      updateImagenesDto.imagenMapaFondo = saveFile(files.imagenMapaFondo[0]);

    if (files?.imagenCentrosUrbanos?.[0])
      updateImagenesDto.imagenCentrosUrbanos = saveFile(files.imagenCentrosUrbanos[0]);

    if (files?.imagenAtraccionesTuristicas?.[0])
      updateImagenesDto.imagenAtraccionesTuristicas = saveFile(files.imagenAtraccionesTuristicas[0]);

    if (files?.imagenesDeCaracteristicas?.length)
      updateImagenesDto.imagenesDeCaracteristicas = files.imagenesDeCaracteristicas.map(saveFile);

    if (files?.imagenesVistasProyecto?.length)
      updateImagenesDto.imagenesVistasProyecto = files.imagenesVistasProyecto.map(saveFile);

    // 5. Si hay imágenes, actualizar el proyecto con las URLs
    if (Object.keys(updateImagenesDto).length > 0) {
      return this.ProjectsService.updateImages(project.id, updateImagenesDto);
    }

    return project;
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.ProjectsService.findAll(paginationDto);
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.ProjectsService.findOnePlain(term);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @GetUser() user: User,
  ) {
    return this.ProjectsService.update(id, updateProjectDto, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.admin)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ProjectsService.remove(id);
  }
}
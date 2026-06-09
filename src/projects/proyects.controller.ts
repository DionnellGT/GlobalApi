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
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Usamos el name del body para construir la carpeta
          // igual que lo hace el slug: lowercase + espacios a _
          const folderName = (req.body.name as string)
            ?.toLowerCase()
            .trim()
            .replaceAll(' ', '_')
            .replaceAll("'", '') || 'default';

          const folderPath = `./static/projects/${folderName}`;
          fs.mkdirSync(folderPath, { recursive: true });
          cb(null, folderPath);
        },
        filename: fileNamer,  // ← usa el helper existente que genera uuid
      }),
    },
  ),
)
async create(
  @Body() body: any,
  @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] },
  @GetUser() user: User,
) {
  const hostApi = this.configService.get('HOST_API');

  const parseField = (field: any) => {
    if (!field) return undefined;
    try { return JSON.parse(field); } catch { return field; }
  };

  // La carpeta se nombró con el name, pero el slug puede variar
  // levemente (ej: acentos). Usamos el mismo sanitizado para la URL.
  const folderName = (body.name as string)
    ?.toLowerCase()
    .trim()
    .replaceAll(' ', '_')
    .replaceAll("'", '') || 'default';

  // Helper para construir la URL a partir del filename que multer ya guardó
  const toUrl = (file: Express.Multer.File): string =>
    `${hostApi}/files/project/${folderName}/${file.filename}`;

  const createProjectDto: CreateProjectDto = {
    name:               body.name,
    idSlug:             body.idSlug,
    marca:              body.marca,
    orden:              body.orden ? parseInt(body.orden) : undefined,
    isActive:           body.isActive !== undefined ? body.isActive === 'true' : undefined,
    linkMapa:           body.linkMapa,
    vistaProyecto360:   body.vistaProyecto360,
    centrosUrbanosCercanos:   parseField(body.centrosUrbanosCercanos),
    atraccionesTuristicas:    parseField(body.atraccionesTuristicas),

    // Imágenes simples — si viene el archivo usamos su URL, si no undefined
    imageCarrousel:             files?.imageCarrousel?.[0]
                                  ? toUrl(files.imageCarrousel[0]) : undefined,
    imagenBannerPrincipal:      files?.imagenBannerPrincipal?.[0]
                                  ? toUrl(files.imagenBannerPrincipal[0]) : undefined,
    imagenBannerPrincipalMobile: files?.imagenBannerPrincipalMobile?.[0]
                                  ? toUrl(files.imagenBannerPrincipalMobile[0]) : undefined,
    imagenBaner2:               files?.imagenBaner2?.[0]
                                  ? toUrl(files.imagenBaner2[0]) : undefined,
    imagenMapaFondo:            files?.imagenMapaFondo?.[0]
                                  ? toUrl(files.imagenMapaFondo[0]) : undefined,
    imagenCentrosUrbanos:       files?.imagenCentrosUrbanos?.[0]
                                  ? toUrl(files.imagenCentrosUrbanos[0]) : undefined,
    imagenAtraccionesTuristicas: files?.imagenAtraccionesTuristicas?.[0]
                                  ? toUrl(files.imagenAtraccionesTuristicas[0]) : undefined,

    // Imágenes múltiples
    imagenesDeCaracteristicas:  files?.imagenesDeCaracteristicas?.length
                                  ? files.imagenesDeCaracteristicas.map(toUrl) : undefined,
    imagenesVistasProyecto:     files?.imagenesVistasProyecto?.length
                                  ? files.imagenesVistasProyecto.map(toUrl) : undefined,
  };

  // Un solo create — ya incluye todo, imágenes y relaciones
  return this.ProjectsService.create(createProjectDto, user);
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
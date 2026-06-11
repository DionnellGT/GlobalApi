import {
  Controller, Get, Post, Body, Patch, Param,
  Delete, ParseUUIDPipe, Query,
  UseInterceptors, UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';

import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';
import { ProjectsService } from './proyects.service';
import { ConfigService } from '@nestjs/config';
import { PROJECT_FILE_FIELDS, projectMulterOptions, buildCreateProjectDto, buildFolderName } from './helpers';
import { uploadBufferToCloudinary } from '../files/cloudinary.helper';
import { v4 as uuid } from 'uuid';
import { Marca } from './enums';

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
  @UseInterceptors(FileFieldsInterceptor(PROJECT_FILE_FIELDS, projectMulterOptions))
  async create(
    @Body() body: any,
    @UploadedFiles() files: { [fieldname: string]: Express.Multer.File[] },
    @GetUser() user: User,
  ) {
    // La carpeta en Cloudinary será: projects/{marca}_{slug}
    // Ejemplo: projects/elavellano_parcelas_chiloe
    const folderName = buildFolderName(body.name, body.marca);
    const cloudinaryFolder = `projects/${folderName}`;

    if (files && Object.keys(files).length > 0) {
      for (const field of Object.keys(files)) {
        const arr = files[field];
        for (let i = 0; i < arr.length; i++) {
          const file = arr[i];
          if (!file || !file.buffer) continue;

          // public_id determina la ruta en Cloudinary
          // Resultado: projects/elavellano_parcelas_chiloe/{uuid}
          const publicId = `${cloudinaryFolder}/${uuid()}`;

          try {
            const result = await uploadBufferToCloudinary(file.buffer, file.mimetype, publicId);
            // Guardar la URL segura en el objeto file para que buildCreateProjectDto la use
            arr[i].filename = result.secure_url;
            (arr[i] as any).secure_url = result.secure_url;
          } catch (error: any) {
            // Ahora el error es visible en lugar de ser ignorado silenciosamente
            throw new BadRequestException(
              `Error al subir archivo "${file.originalname}" (campo: ${field}): ${error.message}`
            );
          }
        }
      }
    }

    const createProjectDto = buildCreateProjectDto(
      body,
      files ?? {},
      this.configService.get('HOST_API'),
    );

    return this.ProjectsService.create(createProjectDto, user);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.ProjectsService.findAll(paginationDto);
  }

  @Get('brand/:marca')
  findByMarca(@Param('marca') marca: Marca) {
    return this.ProjectsService.findByMarca(marca);
  }

  @Get('brand/:marca/:idSlug')
  findByMarcaAndSlug(
    @Param('marca') marca: Marca,
    @Param('idSlug') idSlug: string,
  ) {
    return this.ProjectsService.findByMarcaAndSlug(marca, idSlug);
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
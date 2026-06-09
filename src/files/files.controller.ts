import {
  Controller,
  Get,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Res,
  Query,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';

@ApiTags('Files - Get and Upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('project/:projectName/:imageName')
  findProjectImage(
    @Res() res: Response,
    @Param('projectName') projectName: string,
    @Param('imageName') imageName: string,
  ) {
    const path = this.filesService.getStaticProjectImage(projectName, imageName);
    res.sendFile(path);
  }

  @Post('project')
  @ApiQuery({ name: 'projectName', required: true, description: 'Nombre del proyecto (slug o título)' })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: (req, file, cb) => {
          // El nombre del proyecto viene como query param
          const projectName = (req.query.projectName as string)
            ?.toLowerCase()
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_-]/g, '') || 'default';

          const folderPath = `./static/projects/${projectName}`;

          // Crear la carpeta si no existe
          const fs = require('fs');
          fs.mkdirSync(folderPath, { recursive: true });

          cb(null, folderPath);
        },
        filename: fileNamer,
      }),
    }),
  )
  uploadProjectImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('projectName') projectName: string,
  ) {
    if (!file) {
      throw new BadRequestException('Make sure that the file is an image');
    }

    const sanitizedName = projectName
      ?.toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_-]/g, '') || 'default';

    const secureUrl = `${this.configService.get('HOST_API')}/files/project/${sanitizedName}/${file.filename}`;

    return { secureUrl, fileName: file.filename };
  }
}
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
import { memoryStorage } from 'multer';
import { join } from 'path';
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
  @ApiQuery({ name: 'projectName', required: true, description: 'Nombre de carpeta: marca_slug' })
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter,
      storage: memoryStorage(),
    }),
  )
  async uploadProjectImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('projectName') projectName: string,
  ) {
    if (!file) throw new BadRequestException('Make sure that the file is an image');

    const sanitizedName = projectName
      ?.toLowerCase().trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_-]/g, '') || 'default';

    // upload to cloudinary
    try {
      const publicId = `proyectos/${sanitizedName}/${file.originalname.split('.').slice(0, -1).join('.')}_${Date.now()}`;
      // lazy import to avoid cycle
      const { uploadBufferToCloudinary } = require('./cloudinary.helper');
      const res: any = await uploadBufferToCloudinary(file.buffer, file.mimetype, publicId);
      return { secureUrl: res.secure_url, fileName: res.public_id };
    } catch (error) {
      throw new BadRequestException('Error uploading file');
    }
  }
}
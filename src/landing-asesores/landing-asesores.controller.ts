import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { v4 as uuid } from 'uuid';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';
import { uploadBufferToCloudinary } from './files/cloudinary.helper';

import { LandingAsesoresService } from './landing-asesores.service';
import {
  CreateBannerDto, UpdateBannerDto,
  CreateSobreMiDto, UpdateSobreMiDto,
  CreateProyectoDto,
  CreateTestimonioDto, UpdateTestimonioDto,
  CreateMisDatosDto, UpdateMisDatosDto,
} from './dto';
import {
  buildLandingFolder,
  imageMulterOptions,
  mediaMulterOptions,
  getTipoMediaFromMimetype,
  PROYECTO_FILE_FIELDS,
  parseArrayField,
  parseIntField,
} from './helpers';

@ApiTags('Landing Asesores')
@Controller('landing-asesores')
export class LandingAsesoresController {
  constructor(private readonly landingAsesoresService: LandingAsesoresService) {}

  // ───────────────────────── Consultas ─────────────────────────

  @Get()
  @Auth(ValidRoles.admin)
  findAll() {
    return this.landingAsesoresService.findAll();
  }

  @Get(':email')
  findByEmail(@Param('email') email: string) {
    return this.landingAsesoresService.findByEmail(email);
  }

  // ───────────────────────── Vincular Admins como Landing Asesores ─────────────────────────

  @Post('admins/vincular-landing-asesor')
  @Auth(ValidRoles.admin)
  linkAdminsToLandingAsesor() {
    return this.landingAsesoresService.linkAdminsToLandingAsesor();
  }

  // ───────────────────────── Banner ─────────────────────────

  @Post('banner')
  @Auth(ValidRoles.admin, ValidRoles.landingAsesor)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imagen', imageMulterOptions))
  async createBanner(
    @Body() body: CreateBannerDto & { targetEmail?: string },
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
    @Query('targetEmail') targetEmail?: string,
  ) {
    const resolvedEmail = targetEmail ?? body.targetEmail;
    const targetUser = await this.landingAsesoresService.resolveTargetUser(user, resolvedEmail);
    const imagenUrl = await this.uploadIfPresent(file, targetUser.email, 'banner');

    const { targetEmail: _omit, ...dto } = body;
    return this.landingAsesoresService.createBanner(user, resolvedEmail, dto, imagenUrl);
  }

  @Patch('banner')
  @Auth(ValidRoles.admin, ValidRoles.landingAsesor)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imagen', imageMulterOptions))
  async updateBanner(
    @Body() body: UpdateBannerDto & { targetEmail?: string },
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
    @Query('targetEmail') targetEmail?: string,
  ) {
    const resolvedEmail = targetEmail ?? body.targetEmail;
    const targetUser = await this.landingAsesoresService.resolveTargetUser(user, resolvedEmail);
    const imagenUrl = await this.uploadIfPresent(file, targetUser.email, 'banner');

    const { targetEmail: _omit, ...dto } = body;
    return this.landingAsesoresService.updateBanner(user, resolvedEmail, dto, imagenUrl);
  }

  // ───────────────────────── Sobre Mí ─────────────────────────

  @Post('sobre-mi')
  @Auth(ValidRoles.admin, ValidRoles.landingAsesor)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imagen', imageMulterOptions))
  async createSobreMi(
    @Body() body: CreateSobreMiDto & { targetEmail?: string },
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
    @Query('targetEmail') targetEmail?: string,
  ) {
    const resolvedEmail = targetEmail ?? body.targetEmail;
    const targetUser = await this.landingAsesoresService.resolveTargetUser(user, resolvedEmail);
    const imagenUrl = await this.uploadIfPresent(file, targetUser.email, 'sobre-mi');

    const { targetEmail: _omit, ...dto } = body;
    return this.landingAsesoresService.createSobreMi(user, resolvedEmail, dto, imagenUrl);
  }

  @Patch('sobre-mi')
  @Auth(ValidRoles.admin, ValidRoles.landingAsesor)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imagen', imageMulterOptions))
  async updateSobreMi(
    @Body() body: UpdateSobreMiDto & { targetEmail?: string },
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
    @Query('targetEmail') targetEmail?: string,
  ) {
    const resolvedEmail = targetEmail ?? body.targetEmail;
    const targetUser = await this.landingAsesoresService.resolveTargetUser(user, resolvedEmail);
    const imagenUrl = await this.uploadIfPresent(file, targetUser.email, 'sobre-mi');

    const { targetEmail: _omit, ...dto } = body;
    return this.landingAsesoresService.updateSobreMi(user, resolvedEmail, dto, imagenUrl);
  }

  // ───────────────────────── Mis Datos ─────────────────────────

  @Post('mis-datos')
  @Auth(ValidRoles.admin, ValidRoles.landingAsesor)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo', imageMulterOptions))
  async createMisDatos(
    @Body() body: CreateMisDatosDto & { targetEmail?: string },
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
    @Query('targetEmail') targetEmail?: string,
  ) {
    const resolvedEmail = targetEmail ?? body.targetEmail;
    const targetUser = await this.landingAsesoresService.resolveTargetUser(user, resolvedEmail);
    const logoUrl = await this.uploadIfPresent(file, targetUser.email, 'mis-datos');

    const { targetEmail: _omit, ...dto } = body;
    return this.landingAsesoresService.createMisDatos(user, resolvedEmail, dto, logoUrl);
  }

  @Patch('mis-datos')
  @Auth(ValidRoles.admin, ValidRoles.landingAsesor)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('logo', imageMulterOptions))
  async updateMisDatos(
    @Body() body: UpdateMisDatosDto & { targetEmail?: string },
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
    @Query('targetEmail') targetEmail?: string,
  ) {
    const resolvedEmail = targetEmail ?? body.targetEmail;
    const targetUser = await this.landingAsesoresService.resolveTargetUser(user, resolvedEmail);
    const logoUrl = await this.uploadIfPresent(file, targetUser.email, 'mis-datos');

    const { targetEmail: _omit, ...dto } = body;
    return this.landingAsesoresService.updateMisDatos(user, resolvedEmail, dto, logoUrl);
  }

  // ───────────────────────── Proyectos ─────────────────────────

  @Post('proyectos')
  @Auth(ValidRoles.admin, ValidRoles.landingAsesor)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor(PROYECTO_FILE_FIELDS, imageMulterOptions))
  async createProyecto(
    @Body() body: any,
    @UploadedFiles() files: { imagenCaratula?: Express.Multer.File[]; imagenesPopup?: Express.Multer.File[] },
    @GetUser() user: User,
    @Query('targetEmail') targetEmail?: string,
  ) {
    const resolvedEmail = targetEmail ?? body.targetEmail;
    const targetUser = await this.landingAsesoresService.resolveTargetUser(user, resolvedEmail);

    const imagenCaratulaUrl = await this.uploadIfPresent(
      files?.imagenCaratula?.[0],
      targetUser.email,
      'proyectos',
    );
    const imagenesPopupUrls = await this.uploadManyIfPresent(
      files?.imagenesPopup,
      targetUser.email,
      'proyectos',
    );

    const dto = this.buildProyectoDto(body);
    return this.landingAsesoresService.createProyecto(
      user,
      resolvedEmail,
      dto,
      imagenCaratulaUrl,
      imagenesPopupUrls,
    );
  }

  @Patch('proyectos/:id')
  @Auth(ValidRoles.admin, ValidRoles.landingAsesor)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor(PROYECTO_FILE_FIELDS, imageMulterOptions))
  async updateProyecto(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: any,
    @UploadedFiles() files: { imagenCaratula?: Express.Multer.File[]; imagenesPopup?: Express.Multer.File[] },
    @GetUser() user: User,
  ) {
    const proyecto = await this.landingAsesoresService.assertCanEditProyecto(user, id);

    const imagenCaratulaUrl = await this.uploadIfPresent(
      files?.imagenCaratula?.[0],
      proyecto.user.email,
      'proyectos',
    );
    const imagenesPopupUrls = await this.uploadManyIfPresent(
      files?.imagenesPopup,
      proyecto.user.email,
      'proyectos',
    );

    const dto = this.buildProyectoDto(body);
    return this.landingAsesoresService.updateProyecto(
      user,
      id,
      dto,
      imagenCaratulaUrl,
      imagenesPopupUrls?.length ? imagenesPopupUrls : undefined,
    );
  }

  private buildProyectoDto(body: any): CreateProyectoDto {
    return {
      nombre: body.nombre,
      ubicacion: body.ubicacion,
      precio: body.precio,
      badgeLabel: body.badgeLabel,
      badgeColor: body.badgeColor,
      lotesDisponibles: parseIntField(body.lotesDisponibles),
      descripcion: body.descripcion,
      caracteristicas: parseArrayField(body.caracteristicas)?.slice(0, 8),
      linkGoogleMaps: body.linkGoogleMaps,
      link360Maps: body.link360Maps,
    };
  }

  // ───────────────────────── Testimonios ─────────────────────────

  @Post('testimonios')
  @Auth(ValidRoles.admin, ValidRoles.landingAsesor)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('media', mediaMulterOptions))
  async createTestimonio(
    @Body() body: CreateTestimonioDto & { targetEmail?: string },
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
    @Query('targetEmail') targetEmail?: string,
  ) {
    const resolvedEmail = targetEmail ?? body.targetEmail;
    const targetUser = await this.landingAsesoresService.resolveTargetUser(user, resolvedEmail);
    const mediaUrl = await this.uploadIfPresent(file, targetUser.email, 'testimonios');
    const tipoMedia = file ? getTipoMediaFromMimetype(file.mimetype) : undefined;

    const { targetEmail: _omit, ...dto } = body;
    return this.landingAsesoresService.createTestimonio(user, resolvedEmail, dto, mediaUrl, tipoMedia);
  }

  @Patch('testimonios/:id')
  @Auth(ValidRoles.admin, ValidRoles.landingAsesor)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('media', mediaMulterOptions))
  async updateTestimonio(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateTestimonioDto & { targetEmail?: string },
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User,
  ) {
    const testimonio = await this.landingAsesoresService.assertCanEditTestimonio(user, id);
    const mediaUrl = await this.uploadIfPresent(file, testimonio.user.email, 'testimonios');
    const tipoMedia = file ? getTipoMediaFromMimetype(file.mimetype) : undefined;

    const { targetEmail: _omit, ...dto } = body;
    return this.landingAsesoresService.updateTestimonio(user, id, dto, mediaUrl, tipoMedia);
  }

  // ───────────────────────── Subida de archivos ─────────────────────────

  private async uploadIfPresent(
    file: Express.Multer.File | undefined,
    email: string,
    subfolder: string,
  ): Promise<string | undefined> {
    if (!file || !file.buffer) return undefined;

    const publicId = `${buildLandingFolder(email, subfolder)}/${uuid()}`;

    try {
      const result = await uploadBufferToCloudinary(file.buffer, file.mimetype, publicId);
      return result.secure_url;
    } catch (error: any) {
      throw new BadRequestException(
        `Error al subir el archivo "${file.originalname}": ${error.message}`,
      );
    }
  }

  private async uploadManyIfPresent(
    files: Express.Multer.File[] | undefined,
    email: string,
    subfolder: string,
  ): Promise<string[]> {
    if (!files || files.length === 0) return [];

    const urls: string[] = [];
    for (const file of files) {
      const url = await this.uploadIfPresent(file, email, subfolder);
      if (url) urls.push(url);
    }
    return urls;
  }
}

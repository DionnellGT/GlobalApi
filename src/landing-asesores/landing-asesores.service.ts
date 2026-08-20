import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces';
import {
  LandingBanner,
  LandingSobreMi,
  LandingProyecto,
  LandingTestimonio,
  LandingMisDatos,
  TestimonioTipoMedia,
} from './entities';
import {
  CreateBannerDto, UpdateBannerDto,
  CreateSobreMiDto, UpdateSobreMiDto,
  CreateProyectoDto, UpdateProyectoDto,
  CreateTestimonioDto, UpdateTestimonioDto,
  CreateMisDatosDto, UpdateMisDatosDto,
} from './dto';
import { LandingCloudinaryService } from './files/cloudinary.service';

@Injectable()
export class LandingAsesoresService {
  private readonly logger = new Logger(LandingAsesoresService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(LandingBanner)
    private readonly bannerRepository: Repository<LandingBanner>,

    @InjectRepository(LandingSobreMi)
    private readonly sobreMiRepository: Repository<LandingSobreMi>,

    @InjectRepository(LandingProyecto)
    private readonly proyectoRepository: Repository<LandingProyecto>,

    @InjectRepository(LandingTestimonio)
    private readonly testimonioRepository: Repository<LandingTestimonio>,

    @InjectRepository(LandingMisDatos)
    private readonly misDatosRepository: Repository<LandingMisDatos>,

    private readonly landingCloudinaryService: LandingCloudinaryService,
  ) {}

  // ───────────────────────── Helpers de acceso ─────────────────────────

  private isAdmin(user: User): boolean {
    return !!user.roles?.includes(ValidRoles.admin);
  }

  private isLandingAsesor(user: User): boolean {
    return !!user.roles?.includes(ValidRoles.landingAsesor);
  }

  /**
   * Resuelve sobre qué asesor se va a operar:
   * - Admin: debe indicar `targetEmail` (el correo del asesor dueño del landing).
   * - Asesor: siempre opera sobre sí mismo; si manda un `targetEmail` de
   *   otro usuario, se rechaza.
   *
   * Público porque el controller lo usa para validar permisos ANTES de
   * subir cualquier archivo a Cloudinary (evita subir a la carpeta de un
   * asesor cuando la petición terminará siendo rechazada).
   */
  async resolveTargetUser(requester: User, targetEmail?: string): Promise<User> {
    if (this.isAdmin(requester)) {
      if (!targetEmail) {
        throw new BadRequestException(
          'Como admin debes indicar el correo del asesor mediante el parámetro "targetEmail"',
        );
      }
      return this.findLandingAsesorByEmail(targetEmail);
    }

    if (this.isLandingAsesor(requester)) {
      if (
        targetEmail &&
        targetEmail.toLowerCase().trim() !== requester.email.toLowerCase().trim()
      ) {
        throw new ForbiddenException('No tienes permisos sobre el landing de otro asesor');
      }
      return requester;
    }

    throw new ForbiddenException('No tienes permisos para gestionar un landing de asesor');
  }

  private async findLandingAsesorByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email: email.toLowerCase().trim() });

    if (!user || !user.roles?.includes(ValidRoles.landingAsesor)) {
      throw new NotFoundException(`No existe un landing de asesor con el correo "${email}"`);
    }

    return user;
  }

  /**
   * Verifica que quien hace la petición sea dueño del recurso (mismo user)
   * o admin. Se usa en PATCH sobre recursos identificados por :id
   * (proyectos y testimonios), donde el dueño ya está definido por el
   * registro y no por un query param.
   */
  private assertOwnerOrAdmin(requester: User, ownerId: string) {
    if (this.isAdmin(requester)) return;
    if (requester.id === ownerId) return;
    throw new ForbiddenException('No tienes permisos sobre este recurso');
  }

  /**
   * Busca un proyecto por id y valida que el requester sea su dueño o admin.
   * Público porque el controller lo usa para validar permisos ANTES de
   * subir cualquier archivo nuevo a Cloudinary.
   */
  async assertCanEditProyecto(requester: User, id: string): Promise<LandingProyecto> {
    const proyecto = await this.proyectoRepository.findOne({ where: { id } });
    if (!proyecto) throw new NotFoundException(`No existe un proyecto con el id "${id}"`);
    this.assertOwnerOrAdmin(requester, proyecto.user.id);
    return proyecto;
  }

  /**
   * Busca un testimonio por id y valida que el requester sea su dueño o admin.
   * Público por la misma razón que `assertCanEditProyecto`.
   */
  async assertCanEditTestimonio(requester: User, id: string): Promise<LandingTestimonio> {
    const testimonio = await this.testimonioRepository.findOne({ where: { id } });
    if (!testimonio) throw new NotFoundException(`No existe un testimonio con el id "${id}"`);
    this.assertOwnerOrAdmin(requester, testimonio.user.id);
    return testimonio;
  }

  // ───────────────────────── Consultas ─────────────────────────

  async findAll() {
    const asesores = await this.userRepository
      .createQueryBuilder('user')
      .where(':role = ANY(user.roles)', { role: ValidRoles.landingAsesor })
      .getMany();

    return Promise.all(asesores.map((asesor) => this.buildBundle(asesor)));
  }

  async findByEmail(email: string) {
    const asesor = await this.findLandingAsesorByEmail(email);
    return this.buildBundle(asesor);
  }

  // ───────────────────────── Vincular Admins como Landing Asesores ─────────────────────────

  /**
   * Crea, para el usuario dado, los registros "placeholder" que le faltan
   * en las tablas singleton del Landing (Banner, Sobre Mí, Mis Datos) —
   * con valores mínimos válidos, listos para completarse después vía
   * PATCH. Es idempotente: si ya existe el registro, no lo toca.
   *
   * No aplica a Proyectos ni Testimonios: al ser listas, "vacío" ya es su
   * estado por defecto y no tiene sentido un placeholder ahí.
   *
   * Devuelve `true` si creó al menos un registro nuevo.
   */
  async createPlaceholderLandingRecords(user: User): Promise<boolean> {
    const [existingBanner, existingSobreMi, existingMisDatos] = await Promise.all([
      this.bannerRepository.findOne({ where: { user: { id: user.id } } }),
      this.sobreMiRepository.findOne({ where: { user: { id: user.id } } }),
      this.misDatosRepository.findOne({ where: { user: { id: user.id } } }),
    ]);

    let createdSomething = false;

    if (!existingBanner) {
      await this.bannerRepository.save(
        this.bannerRepository.create({
          titulo: 'Banner sin título',
          user,
        }),
      );
      createdSomething = true;
    }

    if (!existingSobreMi) {
      await this.sobreMiRepository.save(
        this.sobreMiRepository.create({
          titulo: 'Sobre Mí',
          user,
        }),
      );
      createdSomething = true;
    }

    if (!existingMisDatos) {
      await this.misDatosRepository.save(
        this.misDatosRepository.create({
          nombre: user.fullName?.trim() || user.email,
          correo: user.email,
          user,
        }),
      );
      createdSomething = true;
    }

    return createdSomething;
  }

  /**
   * Le agrega el role "landing-asesor" a todos los usuarios Admin que
   * todavía no lo tengan, y crea los registros placeholder que les falten
   * en Banner / Sobre Mí / Mis Datos (ver `createPlaceholderLandingRecords`).
   *
   * Es idempotente: si se corre de nuevo y todos los Admin ya tienen el
   * role y sus placeholders creados, no modifica nada y devuelve el
   * mensaje informativo.
   */
  async linkAdminsToLandingAsesor() {
    let admins: User[];

    try {
      admins = await this.userRepository
        .createQueryBuilder('user')
        .where(':role = ANY(user.roles)', { role: ValidRoles.admin })
        .getMany();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('Error al buscar los usuarios Admin', err.stack);
      throw new InternalServerErrorException(
        `Error al buscar los usuarios Admin: ${err.message}`,
      );
    }

    const yaVinculados: string[] = [];
    const vinculadosAhora: string[] = [];

    for (const admin of admins) {
      try {
        const alreadyHadRole = admin.roles?.includes(ValidRoles.landingAsesor);

        if (!alreadyHadRole) {
          // Se usa `update()` (no `save()`) a propósito: `admin` viene de un
          // queryBuilder que NO trae la columna `password` (select: false).
          // Si se usara `.save(admin)`, TypeORM intentaría escribir
          // `password = NULL` y Postgres lo rechaza por la constraint
          // NOT NULL, lo que termina en un 500 genérico.
          const updatedRoles = [...(admin.roles ?? []), ValidRoles.landingAsesor];
          await this.userRepository.update(admin.id, { roles: updatedRoles });
          admin.roles = updatedRoles;
        }

        const createdPlaceholders = await this.createPlaceholderLandingRecords(admin);

        if (alreadyHadRole && !createdPlaceholders) {
          yaVinculados.push(admin.email);
        } else {
          vinculadosAhora.push(admin.email);
        }
      } catch (error) {
        this.logger.error(
          `Error al vincular al admin "${admin.email}"`,
          error instanceof Error ? error.stack : String(error),
        );
        throw new InternalServerErrorException(
          `Error al vincular al admin "${admin.email}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    if (vinculadosAhora.length === 0) {
      return {
        message:
          'Todos los usuarios Admin tienen el role de landing-asesor y su id ya esta enlazado a las tablas de los Landing',
        totalAdmins: admins.length,
        vinculadosAhora,
        yaVinculados,
      };
    }

    return {
      message: `Se vinculó el role "landing-asesor" y se crearon los registros placeholder para ${vinculadosAhora.length} usuario(s) Admin`,
      totalAdmins: admins.length,
      vinculadosAhora,
      yaVinculados,
    };
  }

  private async buildBundle(user: User) {
    const [banner, sobreMi, misDatos, proyectos, testimonios] = await Promise.all([
      this.bannerRepository.findOne({ where: { user: { id: user.id } } }),
      this.sobreMiRepository.findOne({ where: { user: { id: user.id } } }),
      this.misDatosRepository.findOne({ where: { user: { id: user.id } } }),
      this.proyectoRepository.find({ where: { user: { id: user.id } }, order: { createdAt: 'ASC' } }),
      this.testimonioRepository.find({ where: { user: { id: user.id } }, order: { createdAt: 'ASC' } }),
    ]);

    return {
      email: user.email,
      fullName: user.fullName,
      banner,
      sobreMi,
      misDatos,
      proyectos,
      testimonios,
    };
  }

  // ───────────────────────── Banner ─────────────────────────

  async createBanner(
    requester: User,
    targetEmail: string | undefined,
    dto: CreateBannerDto,
    imagenUrl?: string,
  ) {
    const targetUser = await this.resolveTargetUser(requester, targetEmail);

    const existing = await this.bannerRepository.findOne({ where: { user: { id: targetUser.id } } });
    if (existing) {
      throw new ConflictException('Este asesor ya tiene un banner creado, usa PATCH para actualizarlo');
    }

    const banner = this.bannerRepository.create({ ...dto, imagen: imagenUrl, user: targetUser });
    return this.bannerRepository.save(banner);
  }

  async updateBanner(
    requester: User,
    targetEmail: string | undefined,
    dto: UpdateBannerDto,
    imagenUrl?: string,
  ) {
    const targetUser = await this.resolveTargetUser(requester, targetEmail);

    const banner = await this.bannerRepository.findOne({ where: { user: { id: targetUser.id } } });
    if (!banner) {
      throw new NotFoundException('Este asesor todavía no tiene un banner, créalo primero con POST');
    }

    if (imagenUrl) {
      if (banner.imagen) await this.landingCloudinaryService.deleteFileByUrl(banner.imagen);
      banner.imagen = imagenUrl;
    }

    Object.assign(banner, dto);
    return this.bannerRepository.save(banner);
  }

  // ───────────────────────── Sobre Mí ─────────────────────────

  async createSobreMi(
    requester: User,
    targetEmail: string | undefined,
    dto: CreateSobreMiDto,
    imagenUrl?: string,
  ) {
    const targetUser = await this.resolveTargetUser(requester, targetEmail);

    const existing = await this.sobreMiRepository.findOne({ where: { user: { id: targetUser.id } } });
    if (existing) {
      throw new ConflictException(
        'Este asesor ya tiene una sección "Sobre Mí", usa PATCH para actualizarla',
      );
    }

    const sobreMi = this.sobreMiRepository.create({ ...dto, imagen: imagenUrl, user: targetUser });
    return this.sobreMiRepository.save(sobreMi);
  }

  async updateSobreMi(
    requester: User,
    targetEmail: string | undefined,
    dto: UpdateSobreMiDto,
    imagenUrl?: string,
  ) {
    const targetUser = await this.resolveTargetUser(requester, targetEmail);

    const sobreMi = await this.sobreMiRepository.findOne({ where: { user: { id: targetUser.id } } });
    if (!sobreMi) {
      throw new NotFoundException(
        'Este asesor todavía no tiene una sección "Sobre Mí", créala primero con POST',
      );
    }

    if (imagenUrl) {
      if (sobreMi.imagen) await this.landingCloudinaryService.deleteFileByUrl(sobreMi.imagen);
      sobreMi.imagen = imagenUrl;
    }

    Object.assign(sobreMi, dto);
    return this.sobreMiRepository.save(sobreMi);
  }

  // ───────────────────────── Mis Datos ─────────────────────────

  async createMisDatos(
    requester: User,
    targetEmail: string | undefined,
    dto: CreateMisDatosDto,
    logoUrl?: string,
  ) {
    const targetUser = await this.resolveTargetUser(requester, targetEmail);

    const existing = await this.misDatosRepository.findOne({ where: { user: { id: targetUser.id } } });
    if (existing) {
      throw new ConflictException('Este asesor ya tiene "Mis Datos" creados, usa PATCH para actualizarlos');
    }

    const misDatos = this.misDatosRepository.create({ ...dto, logo: logoUrl, user: targetUser });
    return this.misDatosRepository.save(misDatos);
  }

  async updateMisDatos(
    requester: User,
    targetEmail: string | undefined,
    dto: UpdateMisDatosDto,
    logoUrl?: string,
  ) {
    const targetUser = await this.resolveTargetUser(requester, targetEmail);

    const misDatos = await this.misDatosRepository.findOne({ where: { user: { id: targetUser.id } } });
    if (!misDatos) {
      throw new NotFoundException('Este asesor todavía no tiene "Mis Datos", créalos primero con POST');
    }

    if (logoUrl) {
      if (misDatos.logo) await this.landingCloudinaryService.deleteFileByUrl(misDatos.logo);
      misDatos.logo = logoUrl;
    }

    Object.assign(misDatos, dto);
    return this.misDatosRepository.save(misDatos);
  }

  // ───────────────────────── Proyectos ─────────────────────────

  async createProyecto(
    requester: User,
    targetEmail: string | undefined,
    dto: CreateProyectoDto,
    imagenCaratulaUrl?: string,
    imagenesPopupUrls: string[] = [],
  ) {
    const targetUser = await this.resolveTargetUser(requester, targetEmail);

    const proyecto = this.proyectoRepository.create({
      ...dto,
      imagenCaratula: imagenCaratulaUrl,
      imagenesPopup: imagenesPopupUrls,
      user: targetUser,
    });

    return this.proyectoRepository.save(proyecto);
  }

  async updateProyecto(
    requester: User,
    id: string,
    dto: UpdateProyectoDto,
    imagenCaratulaUrl?: string,
    imagenesPopupUrls?: string[],
  ) {
    const proyecto = await this.proyectoRepository.findOne({ where: { id } });
    if (!proyecto) throw new NotFoundException(`No existe un proyecto con el id "${id}"`);

    this.assertOwnerOrAdmin(requester, proyecto.user.id);

    if (imagenCaratulaUrl) {
      if (proyecto.imagenCaratula) await this.landingCloudinaryService.deleteFileByUrl(proyecto.imagenCaratula);
      proyecto.imagenCaratula = imagenCaratulaUrl;
    }

    if (imagenesPopupUrls && imagenesPopupUrls.length > 0) {
      if (proyecto.imagenesPopup?.length) {
        await Promise.all(proyecto.imagenesPopup.map((url) => this.landingCloudinaryService.deleteFileByUrl(url)));
      }
      proyecto.imagenesPopup = imagenesPopupUrls;
    }

    Object.assign(proyecto, dto);
    return this.proyectoRepository.save(proyecto);
  }

  /**
   * Elimina un proyecto y, antes de borrar la fila, elimina de Cloudinary
   * la imagen de carátula y todas las imágenes de detalle.
   */
  async deleteProyecto(requester: User, id: string): Promise<{ message: string }> {
    const proyecto = await this.proyectoRepository.findOne({ where: { id } });
    if (!proyecto) throw new NotFoundException(`No existe un proyecto con el id "${id}"`);

    this.assertOwnerOrAdmin(requester, proyecto.user.id);

    await this.landingCloudinaryService.deleteFilesByUrls([
      proyecto.imagenCaratula,
      ...(proyecto.imagenesPopup ?? []),
    ]);

    await this.proyectoRepository.remove(proyecto);

    return { message: `Se eliminó el proyecto "${proyecto.nombre}"` };
  }

  // ───────────────────────── Testimonios ─────────────────────────

  async createTestimonio(
    requester: User,
    targetEmail: string | undefined,
    dto: CreateTestimonioDto,
    mediaUrl?: string,
    tipoMedia?: TestimonioTipoMedia,
  ) {
    const targetUser = await this.resolveTargetUser(requester, targetEmail);

    const testimonio = this.testimonioRepository.create({
      ...dto,
      media: mediaUrl,
      tipoMedia,
      user: targetUser,
    });

    return this.testimonioRepository.save(testimonio);
  }

  async updateTestimonio(
    requester: User,
    id: string,
    dto: UpdateTestimonioDto,
    mediaUrl?: string,
    tipoMedia?: TestimonioTipoMedia,
  ) {
    const testimonio = await this.testimonioRepository.findOne({ where: { id } });
    if (!testimonio) throw new NotFoundException(`No existe un testimonio con el id "${id}"`);

    this.assertOwnerOrAdmin(requester, testimonio.user.id);

    if (mediaUrl) {
      if (testimonio.media) {
        // Se pasa el resourceType explícito (guardado en la DB) en vez de
        // dejar que se infiera de la extensión de la URL: es la fuente de
        // verdad más confiable para distinguir foto de video.
        const previousResourceType = testimonio.tipoMedia === 'video' ? 'video' : 'image';
        await this.landingCloudinaryService.deleteFileByUrl(testimonio.media, previousResourceType);
      }
      testimonio.media = mediaUrl;
      testimonio.tipoMedia = tipoMedia;
    }

    Object.assign(testimonio, dto);
    return this.testimonioRepository.save(testimonio);
  }
}

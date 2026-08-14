import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

import { buildLandingFolder } from '../helpers';

/**
 * Servicio de Cloudinary propio de "landing-asesores".
 *
 * Vive dentro de este módulo (y no se importa desde el "files" compartido
 * en la raíz de src) a propósito, para que landing-asesores no se cruce ni
 * dependa del helper/servicio de Cloudinary que usan otros módulos
 * (ej: projects).
 *
 * A diferencia del helper anterior (base64 vía `upload()`), acá se sube
 * por stream (`upload_stream`), que no necesita mantener el archivo
 * completo codificado en memoria como string.
 */
@Injectable()
export class LandingCloudinaryService {
  private readonly logger = new Logger(LandingCloudinaryService.name);

  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key:    this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
      secure:     true,
    });
  }

  /**
   * Sube un archivo (imagen o video) al folder dinámico del asesor:
   * landing-asesores/<email>/<subfolder>
   *
   * El resource_type se infiere del mimetype del archivo, para que tanto
   * imágenes como videos (ej: testimonios) se suban correctamente.
   */
  uploadFile(
    file: Express.Multer.File,
    email: string,
    subfolder: string,
  ): Promise<UploadApiResponse> {
    const folder = buildLandingFolder(email, subfolder);
    const resourceType = file.mimetype?.toLowerCase().startsWith('video/') ? 'video' : 'image';

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Upload failed'));
          resolve(result);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Elimina un asset por su public_id de Cloudinary.
   */
  async deleteFile(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<void> {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new BadRequestException(`No se pudo eliminar el archivo: ${publicId}`);
    }
  }

  /**
   * Elimina un asset a partir de su URL segura de Cloudinary (extrae el
   * public_id y el resource_type de la propia URL). No lanza error si la
   * URL es inválida o el borrado falla: el borrado del asset anterior
   * nunca debe bloquear la actualización del nuevo.
   */
  async deleteFileByUrl(url: string): Promise<void> {
    const publicId = this.extractPublicIdFromUrl(url);
    if (!publicId) return;

    try {
      await this.deleteFile(publicId, this.getResourceTypeFromUrl(url));
    } catch (error) {
      this.logger.error(`No se pudo eliminar el asset de Cloudinary "${publicId}":`, error);
    }
  }

  /**
   * Elimina TODOS los assets dentro de un folder de Cloudinary, y luego el
   * folder en sí.
   */
  async deleteFolder(folderPath: string): Promise<void> {
    try {
      await cloudinary.api.delete_resources_by_prefix(folderPath + '/');
      await cloudinary.api.delete_folder(folderPath);
      this.logger.log(`Carpeta de Cloudinary eliminada: ${folderPath}`);
    } catch (error: any) {
      // Si el folder no existe (nunca se subió nada), no es un error real.
      if (error?.error?.http_code === 404 || error?.http_code === 404) {
        this.logger.log(`La carpeta "${folderPath}" no existe — se omite el borrado`);
        return;
      }
      throw error;
    }
  }

  /**
   * Elimina TODO lo que un landing-asesor tiene en Cloudinary:
   * landing-asesores/<email>/ (banner, sobre-mi, mis-datos, proyectos,
   * testimonios). Útil, por ejemplo, si se elimina la cuenta del asesor.
   */
  async deleteAsesorFolder(email: string): Promise<void> {
    const folder = `landing-asesores/${email.trim().toLowerCase()}`;
    await this.deleteFolder(folder);
  }

  /**
   * Extrae el public_id de una URL segura de Cloudinary.
   * Ej: https://res.cloudinary.com/demo/image/upload/v1699999999/folder/sub/name.jpg
   *  -> folder/sub/name
   */
  private extractPublicIdFromUrl(url: string): string | null {
    if (!url || typeof url !== 'string') return null;

    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+(?:\?.*)?$/);
    return match ? match[1] : null;
  }

  /**
   * Determina si una URL de Cloudinary corresponde a un video en base a su
   * extensión, para pasarle el resource_type correcto a `destroy`.
   */
  private getResourceTypeFromUrl(url: string): 'image' | 'video' {
    return /\.(mp4|mov|webm|avi|mkv|m4v)(\?.*)?$/i.test(url) ? 'video' : 'image';
  }
}

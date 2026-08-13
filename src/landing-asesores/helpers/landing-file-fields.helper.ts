import { memoryStorage } from 'multer';
import { TestimonioTipoMedia } from '../entities';

/**
 * Filtro propio de "landing-asesores" para imágenes. Duplicado del que
 * usa el "files" compartido a propósito, para no depender de ni cruzarse
 * con ese módulo (que usan otros proyectos, ej: projects).
 */
export const imageFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File is empty'), false);

  const fileExtension = file.mimetype.toLowerCase().split('/')[1];
  const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

  if (validImageExtensions.includes(fileExtension)) {
    return callback(null, true);
  }

  callback(null, false);
};

/**
 * Filtro que acepta tanto imágenes como videos, usado por el campo
 * "media" de LandingTestimonio (foto o video).
 */
export const mediaFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File is empty'), false);

  const fileExtension = file.mimetype.toLowerCase().split('/')[1];
  const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const validVideoExtensions = ['mp4', 'quicktime', 'webm', 'x-msvideo', 'mov'];

  if (
    validImageExtensions.includes(fileExtension) ||
    validVideoExtensions.includes(fileExtension)
  ) {
    return callback(null, true);
  }

  callback(null, false);
};

export const imageMulterOptions = {
  fileFilter: imageFileFilter,
  storage: memoryStorage(),
};

export const mediaMulterOptions = {
  fileFilter: mediaFileFilter,
  storage: memoryStorage(),
};

// Campos de archivo para LandingProyecto: 1 imagen de carátula + N imágenes de popup
export const PROYECTO_FILE_FIELDS = [
  { name: 'imagenCaratula', maxCount: 1 },
  { name: 'imagenesPopup', maxCount: 10 },
];

/**
 * Determina el tipo de media ('video' | 'foto') a partir del mimetype
 * del archivo subido para un LandingTestimonio.
 */
export const getTipoMediaFromMimetype = (mimetype: string): TestimonioTipoMedia => {
  return mimetype?.toLowerCase().startsWith('video/')
    ? TestimonioTipoMedia.VIDEO
    : TestimonioTipoMedia.FOTO;
};

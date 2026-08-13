import { v2 as cloudinary } from 'cloudinary';

/**
 * Helper de Cloudinary propio de "landing-asesores".
 *
 * Vive dentro de este módulo (y no se importa desde el "files" compartido
 * en la raíz de src) a propósito, para que landing-asesores no se cruce ni
 * dependa del helper de files que usan otros módulos (ej: projects).
 */

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true,
  });
};

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  mimetype: string,
  publicId: string,
  tags?: string[],
) => {
  configureCloudinary();

  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    public_id:     publicId,
    resource_type: 'auto',
    overwrite:     true,
    ...(tags && tags.length > 0 ? { tags } : {}),
  });

  return result;
};

/**
 * Extrae el public_id de una URL segura de Cloudinary.
 * Ej: https://res.cloudinary.com/demo/image/upload/v1699999999/folder/sub/name.jpg
 *  -> folder/sub/name
 */
export const extractPublicIdFromUrl = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;

  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+(?:\?.*)?$/);
  return match ? match[1] : null;
};

/**
 * Determina si una URL de Cloudinary corresponde a un video en base a su
 * extensión, para pasarle el resource_type correcto a `destroy`.
 */
export const getResourceTypeFromUrl = (url: string): 'image' | 'video' => {
  return /\.(mp4|mov|webm|avi|mkv|m4v)(\?.*)?$/i.test(url) ? 'video' : 'image';
};

/**
 * Elimina un archivo de Cloudinary a partir de su URL segura. No lanza error
 * si la URL es inválida o el borrado falla: el borrado del asset anterior
 * nunca debe bloquear la actualización del nuevo.
 */
export const deleteFromCloudinaryByUrl = async (url: string): Promise<void> => {
  const publicId = extractPublicIdFromUrl(url);
  if (!publicId) return;

  configureCloudinary();

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: getResourceTypeFromUrl(url),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`No se pudo eliminar el asset de Cloudinary "${publicId}":`, error);
  }
};

import { v2 as cloudinary } from 'cloudinary';

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  mimetype: string,
  publicId: string,
) => {
  // Configurar dentro de la función, no al importar el módulo.
  // Si se configura a nivel de módulo, process.env aún no tiene los valores
  // porque NestJS/ConfigModule no ha terminado de cargar el .env.
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true,
  });

  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    public_id:     publicId,
    resource_type: 'auto',
    overwrite:     true,
    tags:          [folderName],
  });

  return result;
};
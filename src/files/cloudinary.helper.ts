import { v2 as cloudinary } from 'cloudinary';

// Cloudinary v2 NO lee CLOUDINARY_URL automáticamente desde process.env.
// Hay que configurarlo explícitamente con las 3 variables individuales.
// La CLOUDINARY_URL tiene formato: cloudinary://API_KEY:API_SECRET@CLOUD_NAME

function configureCloudinary() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (cloudinaryUrl) {
    // Parsear la URL: cloudinary://API_KEY:API_SECRET@CLOUD_NAME
    const match = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      cloudinary.config({
        api_key:    match[1],
        api_secret: match[2],
        cloud_name: match[3],
        secure:     true,
      });
      return;
    }
  }

  // Fallback: usar variables individuales
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true,
  });
}

configureCloudinary();

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  mimetype: string,
  publicId: string,
) => {
  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    public_id:     publicId,
    resource_type: 'auto',
    overwrite:     true,
  });
  return result;
};
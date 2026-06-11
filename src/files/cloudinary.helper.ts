import { v2 as cloudinary } from 'cloudinary';

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true,
    ...cloudinary.config(),
  });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  mimetype: string,
  publicId: string,
) => {
  const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    public_id: publicId,
    resource_type: 'auto',
    overwrite: true,
  });
  return result;
};

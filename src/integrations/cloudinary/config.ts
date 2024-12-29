import { Cloudinary } from '@cloudinary/url-gen';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Cloudinary credentials are not properly configured');
}

export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: cloudName || '',
    apiKey: apiKey,
    apiSecret: apiSecret
  }
});
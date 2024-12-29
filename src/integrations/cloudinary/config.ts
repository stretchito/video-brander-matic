import { Cloudinary } from '@cloudinary/url-gen';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
if (!cloudName) {
  console.error('Cloudinary cloud name is not configured');
}

export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: cloudName
  }
});
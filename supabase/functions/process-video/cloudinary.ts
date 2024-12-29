import { v2 as cloudinary } from "https://esm.sh/cloudinary@1.41.0";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: Deno.env.get('CLOUDINARY_CLOUD_NAME'),
  api_key: Deno.env.get('CLOUDINARY_API_KEY'),
  api_secret: Deno.env.get('CLOUDINARY_API_SECRET'),
});

export const uploadToCloudinary = async (url: string, options: any) => {
  console.log(`Uploading to Cloudinary with options:`, options);
  return await cloudinary.uploader.upload(url, options);
};

export const processVideo = async (publicId: string, transformations: any[], outputFormat: string) => {
  console.log(`Processing video with transformations:`, transformations);
  return await cloudinary.video.upload(`cloudinary://${publicId}`, {
    resource_type: 'video',
    public_id: `processed_${publicId}`,
    transformation: transformations,
    format: outputFormat,
  });
};

export const deleteFromCloudinary = async (publicId: string) => {
  console.log(`Deleting from Cloudinary:`, publicId);
  return await cloudinary.uploader.destroy(publicId);
};

export const getOverlayPosition = (position: string) => {
  switch (position) {
    case 'top-left':
      return { gravity: 'north_west', x: 10, y: 10 };
    case 'top-right':
      return { gravity: 'north_east', x: 10, y: 10 };
    case 'bottom':
      return { gravity: 'south', y: 10 };
    case 'center':
      return { gravity: 'center' };
    default:
      return { gravity: 'north_west', x: 10, y: 10 };
  }
};
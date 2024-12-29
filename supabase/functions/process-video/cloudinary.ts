import { v2 as cloudinary } from "https://esm.sh/cloudinary@1.41.0";

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: Deno.env.get('CLOUDINARY_CLOUD_NAME'),
  api_key: Deno.env.get('CLOUDINARY_API_KEY'),
  api_secret: Deno.env.get('CLOUDINARY_API_SECRET'),
});

export const uploadToCloudinary = async (url: string, options: any) => {
  try {
    console.log(`Uploading to Cloudinary with options:`, options);
    // Ensure URL is properly formatted
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    return await cloudinary.uploader.upload(formattedUrl, options);
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

export const processVideo = async (publicId: string, transformations: any[], outputFormat: string) => {
  try {
    console.log(`Processing video with transformations:`, transformations);
    const result = await cloudinary.uploader.explicit(publicId, {
      resource_type: 'video',
      type: 'upload',
      eager: [{
        transformation: transformations,
        format: outputFormat
      }]
    });
    return result.eager[0];
  } catch (error) {
    console.error('Error processing video in Cloudinary:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId: string) => {
  try {
    console.log(`Deleting from Cloudinary:`, publicId);
    return await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
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
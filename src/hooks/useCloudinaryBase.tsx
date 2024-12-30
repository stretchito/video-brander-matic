import { uploadToCloudinary } from '@/utils/cloudinary/upload';
import { toast } from 'sonner';

export const useCloudinaryBase = () => {
  const processVideo = async (
    file: File,
    logoFile: File,
    position: string,
    greyscale: boolean,
    format: string
  ) => {
    try {
      console.log('Starting video upload to Cloudinary:', {
        videoFile: file.name,
        logoFile: logoFile.name
      });

      const videoUploadResponse = await uploadToCloudinary(file, 'video');
      if (!videoUploadResponse) {
        throw new Error('Video upload failed');
      }

      console.log('Video uploaded successfully:', videoUploadResponse);

      const logoUploadResponse = await uploadToCloudinary(logoFile, 'image');
      if (!logoUploadResponse) {
        throw new Error('Logo upload failed');
      }

      console.log('Logo uploaded successfully:', logoUploadResponse);

      // Return the processed video details
      return {
        finalVideoUrl: videoUploadResponse.secure_url,
        videoPublicId: videoUploadResponse.public_id,
        logoPublicId: logoUploadResponse.public_id
      };
    } catch (error: any) {
      console.error('Error in Cloudinary processing:', error);
      const errorMessage = error.message || 'Error processing video with Cloudinary';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { processVideo };
};
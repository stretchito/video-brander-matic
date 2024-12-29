import { getCloudinaryConfig } from '@/utils/cloudinaryConfig';
import { PositionType, VideoFormat } from '@/types/videoProcessing';
import { uploadToCloudinary, getOverlayPosition } from '@/utils/cloudinaryUtils';
import { toast } from 'sonner';

export const useCloudinaryProcessing = () => {
  const processVideo = async (
    videoFile: File,
    logoFile: File,
    position: PositionType,
    greyscale: boolean,
    format: VideoFormat
  ) => {
    try {
      // Get Cloudinary configuration
      const config = await getCloudinaryConfig();
      
      // Upload logo first
      console.log('Uploading logo...');
      const logoUpload = await uploadToCloudinary(logoFile, 'image');
      console.log('Logo uploaded:', logoUpload);
      
      // Upload video
      console.log('Uploading video...');
      const videoUpload = await uploadToCloudinary(videoFile, 'video');
      console.log('Video uploaded:', videoUpload);
      
      // Create transformation string
      const transformations = [];
      if (greyscale) {
        transformations.push('e_grayscale');
      }

      // Add logo overlay with position
      const overlayPosition = getOverlayPosition(position);
      const overlayTransform = `l_${logoUpload.public_id},g_${overlayPosition.gravity},x_${overlayPosition.x},y_${overlayPosition.y}`;
      transformations.push(overlayTransform);

      // Create final video URL
      const transformationString = transformations.join(',');
      const finalVideoUrl = `https://res.cloudinary.com/${config.cloudName}/video/upload/${transformationString}/${videoUpload.public_id}.${format}`;
      
      console.log('Verifying processed video URL:', finalVideoUrl);
      
      // Verify the video URL is accessible
      const response = await fetch(finalVideoUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('Processed video not yet available');
      }

      console.log('Video processing completed successfully');
      return {
        finalVideoUrl,
        videoPublicId: videoUpload.public_id,
        logoPublicId: logoUpload.public_id
      };
    } catch (error) {
      console.error('Video processing error:', error);
      toast.error('Error processing video: ' + (error as Error).message);
      throw error;
    }
  };

  return { processVideo };
};
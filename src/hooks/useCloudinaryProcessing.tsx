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
      
      // Add greyscale before logo overlay if enabled
      if (greyscale) {
        transformations.push('e_grayscale');
      }

      // Add logo overlay with position after any video effects
      const overlayPosition = getOverlayPosition(position);
      // Add logo with size constraints (h_100,w_300,c_fit ensures the logo maintains aspect ratio within these limits)
      // fl_layer_apply,fl_relative ensures the logo is always rendered on top
      const overlayTransform = `l_${logoUpload.public_id},h_100,w_300,c_fit,g_${overlayPosition.gravity},x_${overlayPosition.x},y_${overlayPosition.y},fl_layer_apply,fl_relative`;
      transformations.push(overlayTransform);

      // Create final video URL with version to ensure fresh transformation
      const transformationString = transformations.join('/');
      const finalVideoUrl = `https://res.cloudinary.com/${config.cloudName}/video/upload/${transformationString}/v${videoUpload.version}/${videoUpload.public_id}.${format}`;
      
      console.log('Final Processing...');
      
      // Add a delay and verify the video URL is accessible
      let retryCount = 0;
      const maxRetries = 10;
      let videoReady = false;

      while (!videoReady && retryCount < maxRetries) {
        try {
          const response = await fetch(finalVideoUrl, { method: 'HEAD' });
          if (response.ok) {
            videoReady = true;
          } else {
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (!videoReady) {
        throw new Error('Processed video not available after multiple attempts');
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
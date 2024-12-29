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
      
      // Get logo position
      const overlayPosition = getOverlayPosition(position);
      
      // Build transformation array
      const transformations = [];
      
      // Add saturation effect if greyscale is enabled
      if (greyscale) {
        transformations.push('e_saturation:10');
      }
      
      // Add logo overlay with correct positioning and size constraints
      // Make sure to use the full public_id including folder if present
      const logoPublicId = logoUpload.public_id.replace(/\//g, ':');
      transformations.push(
        `l_${logoPublicId}/c_scale,h_100,w_300` + 
        `/g_${overlayPosition.gravity},x_${overlayPosition.x},y_${overlayPosition.y},fl_layer_apply`
      );
      
      // Join transformations with forward slashes
      const transformationString = transformations.join('/');
      console.log('Transformation string:', transformationString);
      
      // Create final video URL with proper version handling
      const finalVideoUrl = `https://res.cloudinary.com/${config.cloudName}/video/upload/${transformationString}/v${videoUpload.version}/${videoUpload.public_id}.${format}`;
      console.log('Final video URL:', finalVideoUrl);
      
      // Verify video URL is accessible
      let retryCount = 0;
      const maxRetries = 10;
      let videoReady = false;

      while (!videoReady && retryCount < maxRetries) {
        try {
          const response = await fetch(finalVideoUrl, { method: 'HEAD' });
          if (response.ok) {
            videoReady = true;
            console.log('Video URL verified and accessible');
          } else {
            console.log(`Attempt ${retryCount + 1}: Response status:`, response.status);
            retryCount++;
            console.log(`Retry ${retryCount}/${maxRetries} - Video not ready yet`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.log(`Attempt ${retryCount + 1} error:`, error);
          retryCount++;
          console.log(`Retry ${retryCount}/${maxRetries} - Error checking video:`, error);
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
import { getCloudinaryConfig } from '@/utils/cloudinaryConfig';
import { PositionType, VideoFormat } from '@/types/videoProcessing';
import { uploadToCloudinary } from '@/utils/cloudinaryUtils';
import { buildTransformationString, buildCloudinaryUrl } from '@/utils/cloudinaryTransformations';
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
      console.log('Fetching Cloudinary configuration...');
      const config = await getCloudinaryConfig();
      console.log('Cloudinary configuration received');
      
      // Upload logo first
      console.log('Uploading logo...', logoFile.name);
      const logoUpload = await uploadToCloudinary(logoFile, 'image');
      console.log('Logo uploaded:', logoUpload);
      
      // Upload video
      console.log('Uploading video...', videoFile.name);
      const videoUpload = await uploadToCloudinary(videoFile, 'video');
      console.log('Video uploaded:', videoUpload);
      
      // Build transformation string using video metadata
      console.log('Building transformation string with parameters:', {
        position,
        greyscale,
        videoMetadata: {
          width: videoUpload.width,
          height: videoUpload.height
        }
      });

      const transformationString = buildTransformationString(
        logoUpload.public_id,
        position,
        greyscale,
        {
          width: videoUpload.width,
          height: videoUpload.height
        }
      );
      
      // Create final video URL
      const finalVideoUrl = buildCloudinaryUrl(
        config.cloudName,
        transformationString,
        videoUpload.version.toString(),
        videoUpload.public_id,
        format
      );

      console.log('=== FINAL VIDEO URL ===');
      console.log(finalVideoUrl);
      console.log('======================');
      
      // Verify video URL is accessible
      let retryCount = 0;
      const maxRetries = 10;
      let videoReady = false;

      while (!videoReady && retryCount < maxRetries) {
        try {
          console.log(`Attempt ${retryCount + 1}: Checking URL:`, finalVideoUrl);
          const response = await fetch(finalVideoUrl, { method: 'HEAD' });
          if (response.ok) {
            videoReady = true;
            console.log('Video URL verified and accessible');
            console.log('Final working URL:', finalVideoUrl);
          } else {
            console.log(`Attempt ${retryCount + 1}: Response status:`, response.status);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.log(`Attempt ${retryCount + 1} error:`, error);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (!videoReady) {
        throw new Error('Processed video not available after multiple attempts');
      }

      console.log('Video processing completed successfully');
      console.log('Use this URL to access the video:', finalVideoUrl);
      
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
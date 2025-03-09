
import { useState } from 'react';
import { getCloudinaryConfig } from '@/utils/cloudinaryConfig';
import { PositionType, VideoFormat } from '@/types/videoProcessing';
import { uploadToCloudinary } from '@/utils/cloudinaryUtils';
import { buildTransformationString, buildCloudinaryUrl } from '@/utils/cloudinaryTransformations';
import { toast } from 'sonner';

// Define interfaces for Cloudinary response types
interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  url: string;
  secure_url: string;
}

export const useCloudinaryProcessing = () => {
  const [logoProgress, setLogoProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);

  const processVideo = async (
    videoFile: File,
    logoFile: File,
    position: PositionType,
    greyscale: boolean,
    format: VideoFormat
  ) => {
    try {
      // Reset progress states
      setLogoProgress(0);
      setVideoProgress(0);
      setProcessingProgress(0);

      // Get Cloudinary configuration
      toast.info('Retrieving Cloudinary configuration...');
      const config = await getCloudinaryConfig();
      
      if (!config || !config.cloudName) {
        toast.error('Invalid Cloudinary configuration: Missing cloud name');
        throw new Error('Invalid Cloudinary configuration: Missing cloud name');
      }
      
      console.log('Starting video processing for:', videoFile.name);
      console.log('Using Cloudinary cloud name:', config.cloudName);
      
      // Upload logo first
      console.log('Uploading logo...', logoFile.name);
      toast.info(`Uploading logo to Cloudinary (${config.cloudName})...`);
      const logoUpload = await uploadToCloudinary(logoFile, 'image', (progress) => {
        setLogoProgress(progress);
      }) as CloudinaryUploadResponse;
      console.log('Logo uploaded:', logoUpload);
      
      // Upload video
      console.log('Uploading video...', videoFile.name);
      toast.info(`Uploading video to Cloudinary (${config.cloudName})...`);
      const videoUpload = await uploadToCloudinary(videoFile, 'video', (progress) => {
        setVideoProgress(progress);
      }) as CloudinaryUploadResponse;
      console.log('Video uploaded:', videoUpload);
      
      // Build transformation string using video metadata
      toast.info('Creating video with logo overlay...');
      setProcessingProgress(50);
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

      toast.info('Waiting for Cloudinary to process the video...');
      while (!videoReady && retryCount < maxRetries) {
        try {
          setProcessingProgress(50 + Math.min(48, (retryCount * 5)));
          console.log(`Attempt ${retryCount + 1}: Checking URL:`, finalVideoUrl);
          const response = await fetch(finalVideoUrl, { method: 'HEAD' });
          if (response.ok) {
            videoReady = true;
            setProcessingProgress(100);
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

  return { 
    processVideo,
    logoProgress,
    videoProgress,
    processingProgress
  };
};

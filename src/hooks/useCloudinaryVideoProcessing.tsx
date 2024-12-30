import { supabase } from '@/integrations/supabase/client';
import { useCloudinaryBase } from './useCloudinaryBase';
import { PositionType, VideoFormat } from '@/types/videoProcessing';
import { toast } from 'sonner';

export const useCloudinaryVideoProcessing = () => {
  const { processVideo } = useCloudinaryBase();

  const processVideoWithCloudinary = async (
    file: File,
    logoFile: File,
    position: PositionType,
    greyscale: boolean,
    format: VideoFormat,
    userId: string
  ) => {
    console.log('Starting Cloudinary video processing:', {
      videoFile: file.name,
      logoFile: logoFile.name,
      position,
      greyscale,
      format
    });

    try {
      const { finalVideoUrl, videoPublicId, logoPublicId } = await processVideo(
        file,
        logoFile,
        position,
        greyscale,
        format
      );

      console.log('Cloudinary processing completed:', {
        finalVideoUrl,
        videoPublicId,
        logoPublicId
      });

      const { error: jobError } = await supabase
        .from('processing_jobs')
        .insert({
          user_id: userId,
          video_path: videoPublicId,
          logo_path: logoPublicId,
          position,
          greyscale,
          output_format: format,
          status: 'completed',
          output_path: finalVideoUrl
        });

      if (jobError) {
        console.error('Error saving job to database:', jobError);
        toast.error('Error saving processing job');
        throw jobError;
      }

      console.log('Processing job saved successfully');
      return finalVideoUrl;
    } catch (error: any) {
      console.error('Error in processVideoWithCloudinary:', error);
      const errorMessage = error.message || 'Unknown error occurred during video processing';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { processVideoWithCloudinary };
};
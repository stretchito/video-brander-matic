import { supabase } from '@/integrations/supabase/client';
import { useCloudinaryProcessing } from './useCloudinaryProcessing';
import { PositionType, VideoFormat } from '@/types/videoProcessing';
import { toast } from 'sonner';

export const useCloudinaryVideoProcessing = () => {
  const { processVideo } = useCloudinaryProcessing();

  const processVideoWithCloudinary = async (
    file: File,
    logoFile: File,
    position: PositionType,
    greyscale: boolean,
    format: VideoFormat,
    userId: string
  ) => {
    const { finalVideoUrl, videoPublicId, logoPublicId } = await processVideo(
      file,
      logoFile,
      position,
      greyscale,
      format
    );

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
      throw jobError;
    }

    return finalVideoUrl;
  };

  return { processVideoWithCloudinary };
};
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useVideoState } from './useVideoState';
import { useProcessingStatus } from './useProcessingStatus';
import { useCloudinaryProcessing } from './useCloudinaryProcessing';
import { useEffect } from 'react';

export const useVideoProcessing = () => {
  const videoState = useVideoState();
  const processingStatus = useProcessingStatus();
  const { processVideo } = useCloudinaryProcessing();

  // Clear videos on page load/refresh
  useEffect(() => {
    videoState.setVideoFiles([]);
  }, []);

  const handleProcess = async () => {
    try {
      if (videoState.videoFiles.length === 0 || !videoState.logoFile) {
        toast.error('Please upload both video and logo files');
        return;
      }

      processingStatus.setIsProcessing(true);
      processingStatus.updateStatus('processing', 'Preparing files...', 10);

      const processedUrls: string[] = [];

      for (const [index, { file }] of videoState.videoFiles.entries()) {
        processingStatus.updateStatus(
          'processing',
          `Processing video ${index + 1} of ${videoState.videoFiles.length}`,
          30
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        processingStatus.updateStatus('processing', 'Final Processing...', 70);
        
        const { finalVideoUrl, videoPublicId, logoPublicId } = await processVideo(
          file,
          videoState.logoFile,
          videoState.position,
          videoState.greyscale,
          videoState.format
        );

        processedUrls.push(finalVideoUrl);

        const { error: jobError } = await supabase
          .from('processing_jobs')
          .insert({
            user_id: user.id,
            video_path: videoPublicId,
            logo_path: logoPublicId,
            position: videoState.position,
            greyscale: videoState.greyscale,
            output_format: videoState.format,
            status: 'completed',
            output_path: finalVideoUrl
          });

        if (jobError) {
          throw jobError;
        }
      }

      processingStatus.updateStatus(
        'completed',
        processedUrls.join(','),
        100
      );

      toast.success('Video processing completed!');

    } catch (error) {
      console.error('Processing error:', error);
      processingStatus.updateStatus(
        'error',
        'Error processing video',
        0
      );
      toast.error('Error processing video');
    } finally {
      processingStatus.setIsProcessing(false);
    }
  };

  return {
    ...videoState,
    ...processingStatus,
    handleProcess
  };
};
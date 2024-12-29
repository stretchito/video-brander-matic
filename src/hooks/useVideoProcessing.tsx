import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useVideoState } from './useVideoState';
import { useProcessingStatus } from './useProcessingStatus';
import { useCloudinaryProcessing } from './useCloudinaryProcessing';

export const useVideoProcessing = () => {
  const videoState = useVideoState();
  const processingStatus = useProcessingStatus();
  const { processVideo } = useCloudinaryProcessing();

  const handleProcess = async () => {
    try {
      if (videoState.videoFiles.length === 0 || !videoState.logoFile) {
        toast.error('Please upload both video and logo files');
        return;
      }

      processingStatus.setIsProcessing(true);
      processingStatus.setStatus('processing');
      processingStatus.setCurrentAction('Uploading files to Cloudinary...');
      processingStatus.setProgress(10);

      // Process each video
      for (const [index, { file }] of videoState.videoFiles.entries()) {
        processingStatus.setCurrentAction(`Processing video ${index + 1} of ${videoState.videoFiles.length}`);
        processingStatus.setProgress(50 + (index * 30 / videoState.videoFiles.length));

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        processingStatus.setCurrentAction('Final Processing...');
        
        const { finalVideoUrl, videoPublicId, logoPublicId } = await processVideo(
          file,
          videoState.logoFile,
          videoState.position,
          videoState.greyscale,
          videoState.format
        );

        // Store job in Supabase
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

        processingStatus.setProcessedVideoUrl(finalVideoUrl);
        processingStatus.setProgress(70 + (index * 30 / videoState.videoFiles.length));
      }

      processingStatus.setProgress(100);
      processingStatus.setStatus('completed');
      processingStatus.setCurrentAction(processingStatus.processedVideoUrl);
      toast.success('Video processing completed!');

    } catch (error) {
      console.error('Processing error:', error);
      processingStatus.setStatus('error');
      processingStatus.setCurrentAction('Error processing video');
      processingStatus.setProgress(0);
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
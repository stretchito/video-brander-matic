import { useVideoState } from './useVideoState';
import { useVideoProcessingState } from './useVideoProcessingState';
import { useCloudinaryVideoProcessing } from './useCloudinaryVideoProcessing';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect } from 'react';

export const useVideoProcessing = () => {
  const videoState = useVideoState();
  const processingState = useVideoProcessingState();
  const { processVideoWithCloudinary } = useCloudinaryVideoProcessing();

  // Clear videos on page load/refresh
  useEffect(() => {
    videoState.setVideoFiles([]);
    processingState.setProcessedCount(0);
    processingState.setProcessedUrls([]);
  }, []);

  const handleProcess = async () => {
    try {
      if (videoState.videoFiles.length === 0 || !videoState.logoFile) {
        toast.error('Please upload both video and logo files');
        return;
      }

      processingState.setIsProcessing(true);
      processingState.updateStatus('processing', 'Preparing files...', 10);

      processingState.setProcessedCount(0);
      processingState.setProcessedUrls([]);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Process videos sequentially
      for (const [index, { file }] of videoState.videoFiles.entries()) {
        const currentVideoNumber = index + 1;
        const totalVideos = videoState.videoFiles.length;
        
        processingState.updateStatus(
          'processing',
          `Processing video ${currentVideoNumber} of ${totalVideos}`,
          Math.round((currentVideoNumber / totalVideos) * 100)
        );

        const finalVideoUrl = await processVideoWithCloudinary(
          file,
          videoState.logoFile,
          videoState.position,
          videoState.greyscale,
          videoState.format,
          user.id
        );

        processingState.setProcessedUrls(prev => [...prev, finalVideoUrl]);
        processingState.setProcessedCount(prev => prev + 1);

        processingState.updateStatus(
          index === videoState.videoFiles.length - 1 ? 'completed' : 'processing',
          finalVideoUrl,
          Math.round((currentVideoNumber / totalVideos) * 100)
        );
      }

      toast.success('Video processing completed!');

    } catch (error) {
      console.error('Processing error:', error);
      processingState.updateStatus('error', 'Error processing video', 0);
      toast.error('Error processing video');
    } finally {
      processingState.setIsProcessing(false);
    }
  };

  return {
    ...videoState,
    ...processingState,
    totalVideos: videoState.videoFiles.length,
    handleProcess
  };
};
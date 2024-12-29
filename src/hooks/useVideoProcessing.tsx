import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useVideoState } from './useVideoState';
import { useProcessingStatus } from './useProcessingStatus';
import { useCloudinaryProcessing } from './useCloudinaryProcessing';
import { useEffect, useState } from 'react';

export const useVideoProcessing = () => {
  const videoState = useVideoState();
  const processingStatus = useProcessingStatus();
  const { processVideo } = useCloudinaryProcessing();
  const [processedCount, setProcessedCount] = useState(0);
  const [processedUrls, setProcessedUrls] = useState<string[]>([]);

  // Clear videos on page load/refresh
  useEffect(() => {
    videoState.setVideoFiles([]);
    setProcessedCount(0);
    setProcessedUrls([]);
  }, []);

  const handleProcess = async () => {
    try {
      if (videoState.videoFiles.length === 0 || !videoState.logoFile) {
        toast.error('Please upload both video and logo files');
        return;
      }

      processingStatus.setIsProcessing(true);
      processingStatus.updateStatus('processing', 'Preparing files...', 10);

      setProcessedCount(0);
      setProcessedUrls([]);

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

        processingStatus.updateStatus(
          'processing', 
          `Processing video ${index + 1}...`, 
          70
        );
        
        const { finalVideoUrl, videoPublicId, logoPublicId } = await processVideo(
          file,
          videoState.logoFile,
          videoState.position,
          videoState.greyscale,
          videoState.format
        );

        // Add the new URL to our processed URLs array
        setProcessedUrls(prev => [...prev, finalVideoUrl]);
        setProcessedCount(prev => prev + 1);

        // Update the current action to show all processed URLs
        processingStatus.updateStatus(
          index === videoState.videoFiles.length - 1 ? 'completed' : 'processing',
          processedUrls.join(','),
          Math.round((index + 1) / videoState.videoFiles.length * 100)
        );

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
    processedCount,
    totalVideos: videoState.videoFiles.length,
    handleProcess
  };
};
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useVideoState } from './useVideoState';
import { useProcessingStatus } from './useProcessingStatus';
import { useProcessingSteps } from './useProcessingSteps';

export const useVideoProcessing = () => {
  const videoState = useVideoState();
  const processingStatus = useProcessingStatus();
  const processingSteps = useProcessingSteps();
  const [processedCount, setProcessedCount] = useState(0);
  const [processedUrls, setProcessedUrls] = useState<string[]>([]);

  const handleProcess = async () => {
    try {
      if (videoState.videoFiles.length === 0 || !videoState.logoFile) {
        toast.error('Please upload both video and logo files');
        return;
      }

      processingStatus.setIsProcessing(true);
      processingStatus.updateStatus('processing', 'Preparing files...', 10);
      processingSteps.updateSteps(videoState.videoFiles.length * 3, 0, 'Initializing processing...');

      setProcessedCount(0);
      setProcessedUrls([]);

      for (const [index, { file }] of videoState.videoFiles.entries()) {
        processingStatus.updateStatus(
          'processing',
          `Processing video ${index + 1} of ${videoState.videoFiles.length}`,
          30
        );
        processingSteps.updateSteps(
          videoState.videoFiles.length * 3,
          index * 3,
          `Starting video ${index + 1} processing`
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        const { data, error } = await supabase.functions.invoke('process-video', {
          body: {
            videoFile: file,
            logoFile: videoState.logoFile,
            position: videoState.position,
            greyscale: videoState.greyscale,
            format: videoState.format
          }
        });

        if (error) {
          throw error;
        }

        const newUrls = [...processedUrls, data.finalVideoUrl];
        setProcessedUrls(newUrls);
        setProcessedCount(prev => prev + 1);

        processingStatus.updateStatus(
          index === videoState.videoFiles.length - 1 ? 'completed' : 'processing',
          data.finalVideoUrl,
          Math.round((index + 1) / videoState.videoFiles.length * 100)
        );
        processingSteps.updateSteps(
          videoState.videoFiles.length * 3,
          index * 3 + 2,
          `Completed processing video ${index + 1}`
        );
      }

      toast.success('Video processing completed!');

    } catch (error) {
      console.error('Processing error:', error);
      processingStatus.updateStatus('error', 'Error processing video', 0);
      processingSteps.updateSteps(
        processingSteps.totalSteps,
        processingSteps.completedSteps,
        'Processing failed'
      );
      toast.error('Error processing video');
    } finally {
      processingStatus.setIsProcessing(false);
    }
  };

  return {
    ...videoState,
    ...processingStatus,
    ...processingSteps,
    processedCount,
    totalVideos: videoState.videoFiles.length,
    handleProcess
  };
};
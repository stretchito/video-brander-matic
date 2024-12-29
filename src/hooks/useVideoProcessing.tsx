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

      // Process videos sequentially
      for (const [index, { file }] of videoState.videoFiles.entries()) {
        const currentVideoNumber = index + 1;
        const totalVideos = videoState.videoFiles.length;
        
        processingStatus.updateStatus(
          'processing',
          `Processing video ${currentVideoNumber} of ${totalVideos}`,
          Math.round((currentVideoNumber / totalVideos) * 100)
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        const { finalVideoUrl, videoPublicId, logoPublicId } = await processVideo(
          file,
          videoState.logoFile,
          videoState.position,
          videoState.greyscale,
          videoState.format
        );

        // Add the new URL to processed URLs array
        setProcessedUrls(prev => [...prev, finalVideoUrl]);
        setProcessedCount(prev => prev + 1);

        // Update status for each processed video
        processingStatus.updateStatus(
          index === videoState.videoFiles.length - 1 ? 'completed' : 'processing',
          finalVideoUrl,
          Math.round((currentVideoNumber / totalVideos) * 100)
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
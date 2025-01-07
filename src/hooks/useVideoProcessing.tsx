import { toast } from 'sonner';
import { useVideoState } from './useVideoState';
import { useProcessingState } from './useProcessingState';
import { useProcessingSteps } from './useProcessingSteps';
import { useJobPolling } from './useJobPolling';
import { SERVER_URL } from '@/config/server';

export const useVideoProcessing = () => {
  const videoState = useVideoState();
  const processingState = useProcessingState();
  const processingSteps = useProcessingSteps();
  const { pollJobStatus } = useJobPolling();

  const handleProcess = async () => {
    try {
      if (videoState.videoFiles.length === 0 || !videoState.logoFile) {
        toast.error('Please upload both video and logo files');
        return;
      }

      processingState.setIsProcessing(true);
      processingState.updateStatus('processing', 'Preparing files...', 10);
      processingSteps.updateSteps(videoState.videoFiles.length * 3, 0, 'Initializing processing...');

      processingState.setProcessedCount(0);
      processingState.setProcessedUrls([]);

      for (const [index, { file, path }] of videoState.videoFiles.entries()) {
        console.log('Starting to process video:', { path, logoPath: videoState.logoPath });
        
        processingState.updateStatus(
          'processing',
          `Processing video ${index + 1} of ${videoState.videoFiles.length}`,
          30
        );
        
        const response = await fetch(`${SERVER_URL}/process-video`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoUrl: path,
            logoUrl: videoState.logoPath,
            position: videoState.position,
            greyscale: videoState.greyscale,
            format: videoState.format
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Processing failed: ${errorText}`);
        }

        const data = await response.json();
        if (!data.jobId) {
          throw new Error('No job ID received from server');
        }

        const { completed, outputUrl } = await pollJobStatus(data.jobId);
        
        if (completed && outputUrl) {
          const newUrls = [...processingState.processedUrls, outputUrl];
          processingState.setProcessedUrls(newUrls);
          processingState.setProcessedCount(prev => prev + 1);
          processingSteps.updateSteps(
            videoState.videoFiles.length * 3,
            index * 3 + 3,
            `Completed processing video ${index + 1}`
          );
        }

        processingState.updateStatus(
          index === videoState.videoFiles.length - 1 ? 'completed' : 'processing',
          `Processed ${processingState.processedCount + 1} of ${videoState.videoFiles.length} videos`,
          Math.round(((index + 1) / videoState.videoFiles.length) * 100)
        );
      }

      toast.success('Video processing completed!');

    } catch (error) {
      console.error('Processing error:', error);
      processingState.updateStatus('error', error.message || 'Error processing video', 0);
      processingSteps.updateSteps(
        processingSteps.totalSteps,
        processingSteps.completedSteps,
        'Processing failed'
      );
      toast.error(error.message || 'Error processing video');
    } finally {
      processingState.setIsProcessing(false);
    }
  };

  return {
    ...videoState,
    ...processingState,
    ...processingSteps,
    totalVideos: videoState.videoFiles.length,
    handleProcess
  };
};
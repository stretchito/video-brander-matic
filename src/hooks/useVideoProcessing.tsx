import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useVideoState } from './useVideoState';
import { useProcessingStatus } from './useProcessingStatus';
import { useProcessingSteps } from './useProcessingSteps';
import { SERVER_URL } from '@/config/server';

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

      for (const [index, { file, path }] of videoState.videoFiles.entries()) {
        console.log('Processing video:', { path: path, logoPath: videoState.logoPath });
        
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

        // Get the video and logo URLs from Supabase storage
        const { data: videoData } = await supabase.storage
          .from('videos')
          .createSignedUrl(path, 3600); // 1 hour expiry

        const { data: logoData } = await supabase.storage
          .from('logos')
          .createSignedUrl(videoState.logoPath, 3600);

        if (!videoData?.signedUrl || !logoData?.signedUrl) {
          throw new Error('Failed to get signed URLs for video or logo');
        }

        // Send processing request to our server
        const response = await fetch(`${SERVER_URL}/process-video`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoUrl: videoData.signedUrl,
            logoUrl: logoData.signedUrl,
            position: videoState.position,
            greyscale: videoState.greyscale,
            format: videoState.format
          })
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Processing failed: ${error}`);
        }

        const data = await response.json();
        console.log('Processing response:', data);

        // Start polling for job status
        let jobCompleted = false;
        while (!jobCompleted) {
          const statusResponse = await fetch(`${SERVER_URL}/job-status/${data.jobId}`);
          const statusData = await statusResponse.json();
          
          if (statusData.status === 'completed') {
            jobCompleted = true;
            const newUrls = [...processedUrls, statusData.outputUrl];
            setProcessedUrls(newUrls);
            setProcessedCount(prev => prev + 1);
          } else if (statusData.status === 'error') {
            throw new Error(statusData.error || 'Processing failed');
          }
          
          // Wait before next poll
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        processingStatus.updateStatus(
          index === videoState.videoFiles.length - 1 ? 'completed' : 'processing',
          data.outputUrl,
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
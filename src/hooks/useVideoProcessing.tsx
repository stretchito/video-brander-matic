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
          .createSignedUrl(path, 3600);

        const { data: logoData } = await supabase.storage
          .from('logos')
          .createSignedUrl(videoState.logoPath, 3600);

        if (!videoData?.signedUrl || !logoData?.signedUrl) {
          throw new Error('Failed to get signed URLs for video or logo');
        }

        console.log('Sending processing request with URLs:', {
          videoUrl: videoData.signedUrl,
          logoUrl: logoData.signedUrl
        });

        // Send processing request to our server with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minute timeout

        try {
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
            }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Processing failed:', errorText);
            throw new Error(`Processing failed: ${errorText}`);
          }

          const data = await response.json();
          console.log('Processing response:', data);

          if (!data.jobId) {
            throw new Error('No job ID received from server');
          }

          // Start polling for job status
          let jobCompleted = false;
          let retryCount = 0;
          const maxRetries = 60; // 2 minutes of retries (2-second intervals)

          while (!jobCompleted && retryCount < maxRetries) {
            console.log(`Polling job status (attempt ${retryCount + 1})`);
            
            const statusResponse = await fetch(`${SERVER_URL}/job-status/${data.jobId}`);
            if (!statusResponse.ok) {
              console.error('Status check failed:', await statusResponse.text());
              throw new Error('Failed to check job status');
            }

            const statusData = await statusResponse.json();
            console.log('Job status:', statusData);
            
            if (statusData.status === 'completed') {
              jobCompleted = true;
              const newUrls = [...processedUrls, statusData.outputUrl];
              setProcessedUrls(newUrls);
              setProcessedCount(prev => prev + 1);
              processingSteps.updateSteps(
                videoState.videoFiles.length * 3,
                index * 3 + 3,
                `Completed processing video ${index + 1}`
              );
            } else if (statusData.status === 'error') {
              throw new Error(statusData.error || 'Processing failed');
            } else {
              // Wait before next poll
              await new Promise(resolve => setTimeout(resolve, 2000));
              retryCount++;
            }
          }

          if (!jobCompleted) {
            throw new Error('Processing timed out while waiting for completion');
          }

        } catch (error) {
          if (error.name === 'AbortError') {
            throw new Error('Video processing timed out. Please try again with a shorter video.');
          }
          throw error;
        } finally {
          clearTimeout(timeoutId);
        }

        processingStatus.updateStatus(
          index === videoState.videoFiles.length - 1 ? 'completed' : 'processing',
          `Processed ${processedCount + 1} of ${videoState.videoFiles.length} videos`,
          Math.round(((index + 1) / videoState.videoFiles.length) * 100)
        );
      }

      toast.success('Video processing completed!');

    } catch (error) {
      console.error('Processing error:', error);
      processingStatus.updateStatus('error', error.message || 'Error processing video', 0);
      processingSteps.updateSteps(
        processingSteps.totalSteps,
        processingSteps.completedSteps,
        'Processing failed'
      );
      toast.error(error.message || 'Error processing video');
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
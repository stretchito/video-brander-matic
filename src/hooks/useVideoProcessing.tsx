import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useVideoProcessing = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPath, setVideoPath] = useState<string>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPath, setLogoPath] = useState<string>('');
  const [position, setPosition] = useState('top-right');
  const [greyscale, setGreyscale] = useState(false);
  const [format, setFormat] = useState('mp4');
  const [status, setStatus] = useState<'waiting' | 'processing' | 'completed' | 'error'>('waiting');
  const [currentAction, setCurrentAction] = useState('Waiting to start...');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    try {
      setIsProcessing(true);
      setStatus('processing');
      setCurrentAction('Creating processing job...');
      setProgress(10);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      // Create processing job
      const { data: job, error: jobError } = await supabase
        .from('processing_jobs')
        .insert({
          user_id: user.id,
          video_path: videoPath,
          logo_path: logoPath,
          position,
          greyscale,
          output_format: format,
          status: 'pending'
        })
        .select()
        .single();

      if (jobError) {
        throw jobError;
      }

      setProgress(30);
      setCurrentAction('Processing video...');

      // Call the Edge Function to process the video
      const { error: processError } = await supabase.functions
        .invoke('process-video', {
          body: {
            jobId: job.id,
            videoPath,
            logoPath,
            position,
            greyscale,
            outputFormat: format
          }
        });

      if (processError) {
        throw processError;
      }

      // Set up real-time subscription to track job status
      const subscription = supabase
        .channel('processing_jobs')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'processing_jobs',
            filter: `id=eq.${job.id}`
          },
          (payload) => {
            const updatedJob = payload.new;
            setStatus(updatedJob.status);
            
            if (updatedJob.status === 'processing') {
              setProgress(50);
            } else if (updatedJob.status === 'completed') {
              setProgress(100);
              setCurrentAction('Processing completed successfully!');
              toast.success('Video processing completed!');
              setIsProcessing(false);
            } else if (updatedJob.status === 'error') {
              setStatus('error');
              setCurrentAction(`Error: ${updatedJob.error_message}`);
              toast.error('Error processing video');
              setIsProcessing(false);
            }
          }
        )
        .subscribe();

      // Return void instead of the cleanup function
      await Promise.resolve();
    } catch (error) {
      console.error('Processing error:', error);
      setStatus('error');
      setCurrentAction('Error processing video');
      setProgress(0);
      setIsProcessing(false);
      toast.error('Error processing video');
    }
  };

  const handleVideoSelect = (file: File, path: string) => {
    setVideoFile(file);
    setVideoPath(path);
    toast.success('Video uploaded successfully');
  };

  const handleLogoSelect = (file: File, path: string) => {
    setLogoFile(file);
    setLogoPath(path);
    toast.success('Logo uploaded successfully');
  };

  return {
    videoFile,
    videoPath,
    logoFile,
    logoPath,
    position,
    greyscale,
    format,
    status,
    currentAction,
    progress,
    isProcessing,
    setPosition,
    setGreyscale,
    setFormat,
    handleProcess,
    handleVideoSelect,
    handleLogoSelect
  };
};
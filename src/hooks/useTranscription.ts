import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useTranscription = () => {
  const [isTranscribing, setIsTranscribing] = useState(false);

  const startTranscription = async (file: File, path: string) => {
    try {
      setIsTranscribing(true);
      console.log('Starting transcription process for:', file.name);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(path);

      console.log('Invoking transcribe-video function with URL:', urlData.publicUrl);
      
      const { data: transcriptionData, error } = await supabase.functions.invoke('transcribe-video', {
        body: {
          videoUrl: urlData.publicUrl,
          jobId: path,
          userId: user.id,
        },
      });

      if (error) throw error;
      
      console.log('Transcription response:', transcriptionData);
      toast.success('Transcription process started');
      
      return transcriptionData;
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to start transcription process');
      throw error;
    } finally {
      setIsTranscribing(false);
    }
  };

  const getTranscriptionStatus = async (jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('processing_jobs')
        .select('transcription_status, transcription_url, error_message, completed_steps, total_steps')
        .eq('job_id', jobId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching transcription status:', error);
      throw error;
    }
  };

  return { 
    startTranscription,
    getTranscriptionStatus,
    isTranscribing
  };
};
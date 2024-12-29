import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useTranscription = () => {
  const startTranscription = async (file: File, path: string) => {
    try {
      console.log('Starting transcription process for:', file.name);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data } = supabase.storage
        .from('videos')
        .getPublicUrl(path);

      console.log('Invoking transcribe-video function with URL:', data.publicUrl);
      const { data: transcriptionData, error } = await supabase.functions.invoke('transcribe-video', {
        body: {
          videoUrl: data.publicUrl,
          jobId: path,
          userId: user.id,
        },
      });

      if (error) throw error;
      console.log('Transcription response:', transcriptionData);
      toast.success('Transcription process started');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to start transcription process');
    }
  };

  return { startTranscription };
};
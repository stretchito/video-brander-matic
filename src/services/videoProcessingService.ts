import { supabase } from '@/lib/supabase';

interface ProcessVideoOptions {
  videoPath: string;
  logoPath: string;
  position: string;
  greyscale: boolean;
  outputFormat: string;
}

export const processVideo = async (options: ProcessVideoOptions) => {
  try {
    console.log('Starting video processing with FFmpeg...', options);
    
    const { data, error } = await supabase.functions.invoke('process-video', {
      body: options
    });

    if (error) {
      console.error('Error in video processing:', error);
      throw error;
    }

    console.log('Video processing completed:', data);
    return data;
  } catch (error) {
    console.error('Error in video processing service:', error);
    throw error;
  }
};
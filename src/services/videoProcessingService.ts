import { supabase } from '@/lib/supabase';
import { testFFmpegProcessing } from '@/utils/testFFmpeg';

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
    
    const result = await testFFmpegProcessing(options.videoPath, options.logoPath);
    console.log('FFmpeg processing result:', result);
    
    return result;
  } catch (error) {
    console.error('Error in video processing service:', error);
    throw error;
  }
};
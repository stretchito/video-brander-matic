import { supabase } from "@/integrations/supabase/client";

export const testFFmpegProcessing = async (videoPath: string, logoPath: string) => {
  try {
    console.log('Testing FFmpeg processing with:', { videoPath, logoPath });
    
    const { data, error } = await supabase.functions.invoke('test-ffmpeg', {
      body: { videoPath, logoPath }
    });

    if (error) {
      console.error('FFmpeg test error:', error);
      throw error;
    }

    console.log('FFmpeg test result:', data);
    return data;
  } catch (error) {
    console.error('Error in testFFmpegProcessing:', error);
    throw error;
  }
};
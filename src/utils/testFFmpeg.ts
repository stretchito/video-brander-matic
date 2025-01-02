import { supabase } from "@/integrations/supabase/client";

export const testFFmpegProcessing = async (videoPath: string, logoPath: string) => {
  try {
    console.log('Testing FFmpeg processing with:', { videoPath, logoPath });
    
    // Add more detailed logging
    console.log('Invoking test-ffmpeg function...');
    
    const { data, error } = await supabase.functions.invoke('test-ffmpeg', {
      body: { 
        videoPath, 
        logoPath 
      },
      // Adding headers to ensure proper content type
      headers: {
        'Content-Type': 'application/json'
      }
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
import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { processVideo } from '../services/videoProcessingService';

interface ProcessVideoRequest {
  videoUrl: string;
  options: {
    logo_path?: string;
    position?: string;
    greyscale?: boolean;
    output_format?: string;
    transcription_enabled?: boolean;
    captions_enabled?: boolean;
  }
}

export const processVideoHandler = async (
  req: Request<{}, any, ProcessVideoRequest>, 
  res: Response
): Promise<void> => {
  try {
    const { videoUrl, options } = req.body;
    
    if (!videoUrl) {
      res.status(400).json({ error: 'Video URL is required' });
      return;
    }

    const { data, error } = await supabase
      .from('processing_jobs')
      .insert({
        video_path: videoUrl,
        status: 'pending',
        ...options
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating processing job:', error);
      res.status(500).json({ error: 'Failed to create processing job' });
      return;
    }

    const processedVideo = await processVideo({
      videoPath: videoUrl,
      logoPath: options.logo_path || '',
      position: options.position || 'top-left',
      greyscale: options.greyscale || false,
      outputFormat: options.output_format || 'mp4'
    });

    const { error: updateError } = await supabase
      .from('processing_jobs')
      .update({
        status: 'completed',
        output_path: processedVideo.publicUrl
      })
      .eq('id', data.id);

    if (updateError) {
      console.error('Error updating job:', updateError);
      res.status(500).json({ error: 'Failed to update job status' });
      return;
    }

    res.json({ 
      message: 'Video processing completed',
      jobId: data.id,
      outputUrl: processedVideo.publicUrl
    });
    return;

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};
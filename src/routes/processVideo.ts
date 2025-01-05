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

interface ProcessedVideoResult {
  outputPath: string;
  publicUrl?: string;
}

const PROCESSING_TIMEOUT = 300000; // 5 minutes timeout

export const processVideoHandler = async (
  req: Request<{}, any, ProcessVideoRequest>, 
  res: Response
): Promise<void> => {
  // Set a timeout for the entire request
  const timeout = setTimeout(() => {
    console.error('Video processing timeout reached');
    res.status(504).json({ error: 'Processing timeout reached' });
  }, PROCESSING_TIMEOUT);

  try {
    console.log('Received video processing request:', req.body);
    const { videoUrl, options } = req.body;
    
    if (!videoUrl) {
      clearTimeout(timeout);
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
      clearTimeout(timeout);
      res.status(500).json({ error: 'Failed to create processing job' });
      return;
    }

    console.log('Starting video processing with options:', options);
    const processedVideo = await processVideo({
      videoPath: videoUrl,
      logoPath: options.logo_path || '',
      position: options.position || 'top-left',
      greyscale: options.greyscale || false,
      outputFormat: options.output_format || 'mp4'
    }) as ProcessedVideoResult;

    console.log('Video processing completed:', processedVideo);

    const { error: updateError } = await supabase
      .from('processing_jobs')
      .update({
        status: 'completed',
        output_path: processedVideo.outputPath
      })
      .eq('id', data.id);

    if (updateError) {
      console.error('Error updating job:', updateError);
      clearTimeout(timeout);
      res.status(500).json({ error: 'Failed to update job status' });
      return;
    }

    clearTimeout(timeout);
    res.json({ 
      message: 'Video processing completed',
      jobId: data.id,
      outputUrl: processedVideo.outputPath
    });
    return;

  } catch (error) {
    console.error('Server error:', error);
    clearTimeout(timeout);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
    return;
  }
};
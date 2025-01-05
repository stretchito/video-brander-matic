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

const updateJobProgress = async (jobId: string, update: {
  status?: string;
  errorMessage?: string;
}) => {
  try {
    const { error } = await supabase
      .from('processing_jobs')
      .update({
        status: update.status,
        error_message: update.errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (error) {
      console.error('Error updating job progress:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to update job progress:', error);
    throw error;
  }
};

export const processVideoHandler = async (
  req: Request<{}, any, ProcessVideoRequest>, 
  res: Response
): Promise<void> => {
  let timeoutId: NodeJS.Timeout;

  try {
    console.log('Received video processing request:', req.body);
    const { videoUrl, options } = req.body;
    
    if (!videoUrl) {
      res.status(400).json({ error: 'Video URL is required' });
      return;
    }

    // Check if there's already a processing job for this video
    const { data: existingJob } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('video_path', videoUrl)
      .eq('status', 'processing')
      .single();

    if (existingJob) {
      console.log('Found existing processing job:', existingJob);
      res.status(409).json({ 
        error: 'Video is already being processed',
        jobId: existingJob.id
      });
      return;
    }

    // Create new processing job
    const { data: newJob, error: jobError } = await supabase
      .from('processing_jobs')
      .insert({
        video_path: videoUrl,
        status: 'pending',
        ...options
      })
      .select()
      .single();

    if (jobError) {
      console.error('Error creating processing job:', jobError);
      res.status(500).json({ error: 'Failed to create processing job' });
      return;
    }

    // Set up timeout handler
    timeoutId = setTimeout(() => {
      console.error('Video processing timeout reached');
      updateJobProgress(newJob.id, {
        status: 'error',
        errorMessage: 'Processing timeout reached'
      });
      res.status(504).json({ error: 'Processing timeout reached' });
    }, PROCESSING_TIMEOUT);

    console.log('Starting video processing with options:', options);
    const processedVideo = await processVideo({
      videoPath: videoUrl,
      logoPath: options.logo_path || '',
      position: options.position || 'top-left',
      greyscale: options.greyscale || false,
      outputFormat: options.output_format || 'mp4',
      jobId: newJob.id
    }) as ProcessedVideoResult;

    console.log('Video processing completed:', processedVideo);

    clearTimeout(timeoutId);
    res.json({ 
      message: 'Video processing completed',
      jobId: newJob.id,
      outputUrl: processedVideo.outputPath
    });
    return;

  } catch (error) {
    console.error('Server error:', error);
    clearTimeout(timeoutId);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
    return;
  }
};
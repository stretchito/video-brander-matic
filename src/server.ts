import express, { Request, Response } from 'express';
import cors from 'cors';
import { supabase } from './lib/supabase';
import { processVideo } from './services/videoProcessingService';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
  return;
});

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

// Video processing endpoint
app.post('/process-video', async (req: Request<{}, any, ProcessVideoRequest>, res: Response): Promise<void> => {
  try {
    const { videoUrl, options } = req.body;
    
    if (!videoUrl) {
      res.status(400).json({ error: 'Video URL is required' });
      return;
    }

    // Add to processing queue
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

    // Start video processing
    const processedVideo = await processVideo({
      videoPath: videoUrl,
      logoPath: options.logo_path || '',
      position: options.position || 'top-left',
      greyscale: options.greyscale || false,
      outputFormat: options.output_format || 'mp4'
    });

    // Update job with processed video information
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
});

// Job status endpoint
app.get('/job-status/:jobId', async (req: Request<{ jobId: string }>, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    const { data, error } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Error fetching job status:', error);
      res.status(500).json({ error: 'Failed to fetch job status' });
      return;
    }

    if (!data) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    res.json(data);
    return;

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
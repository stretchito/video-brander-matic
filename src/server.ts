import express, { Request, Response } from 'express';
import cors from 'cors';
import { supabase } from './lib/supabase';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
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
app.post('/process-video', async (req: Request<{}, {}, ProcessVideoRequest>, res: Response) => {
  try {
    const { videoUrl, options } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: 'Video URL is required' });
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
      return res.status(500).json({ error: 'Failed to create processing job' });
    }

    res.json({ 
      message: 'Video processing job created',
      jobId: data.id
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Job status endpoint
app.get('/job-status/:jobId', async (req: Request<{ jobId: string }>, res: Response) => {
  try {
    const { jobId } = req.params;

    const { data, error } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Error fetching job status:', error);
      return res.status(500).json({ error: 'Failed to fetch job status' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(data);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
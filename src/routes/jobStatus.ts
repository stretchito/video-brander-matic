import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

export const getJobStatus = async (req: Request<{ jobId: string }>, res: Response): Promise<void> => {
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
};
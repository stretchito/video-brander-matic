import { supabase } from '../lib/supabase';
import { createFFmpegCommand } from './ffmpegService';

interface ProcessVideoParams {
  videoPath: string;
  logoPath: string;
  position: string;
  greyscale: boolean;
  outputFormat: string;
  jobId: string;
}

export const processVideo = async (params: ProcessVideoParams) => {
  const { videoPath, logoPath, position, greyscale, outputFormat, jobId } = params;
  
  console.log('Starting video processing:', { jobId, videoPath });
  
  try {
    await updateJobStatus(jobId, 'processing');

    return new Promise((resolve, reject) => {
      const command = createFFmpegCommand(videoPath, logoPath, position, greyscale);

      command
        .on('end', async () => {
          console.log('FFmpeg processing finished');
          try {
            const outputPath = `processed/${Date.now()}_${jobId}.${outputFormat}`;
            await updateJobCompletion(jobId, outputPath);
            resolve({ outputPath });
          } catch (error) {
            await updateJobError(jobId, error instanceof Error ? error.message : 'Unknown error');
            reject(error);
          }
        })
        .on('error', async (err) => {
          console.error('FFmpeg error:', err);
          await updateJobError(jobId, err.message);
          reject(err);
        });

      command.save(`output.${outputFormat}`);
    });
  } catch (error) {
    console.error('Error in video processing service:', error);
    await updateJobError(jobId, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

const updateJobStatus = async (jobId: string, status: string) => {
  await supabase
    .from('processing_jobs')
    .update({
      status,
      started_at: new Date().toISOString(),
      attempt_count: 1
    })
    .eq('id', jobId);
};

const updateJobCompletion = async (jobId: string, outputPath: string) => {
  await supabase
    .from('processing_jobs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      output_path: outputPath
    })
    .eq('id', jobId);
};

const updateJobError = async (jobId: string, errorMessage: string) => {
  await supabase
    .from('processing_jobs')
    .update({
      status: 'error',
      last_error: errorMessage
    })
    .eq('id', jobId);
};
import ffmpeg from 'fluent-ffmpeg';
import { supabase } from '../lib/supabase';

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
    // Update job status to processing
    await supabase
      .from('processing_jobs')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        attempt_count: 1
      })
      .eq('id', jobId);

    return new Promise((resolve, reject) => {
      const command = ffmpeg(videoPath)
        .input(logoPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing:', progress);
        })
        .on('end', async () => {
          console.log('FFmpeg processing finished');
          try {
            const outputPath = `processed/${Date.now()}_${jobId}.${outputFormat}`;
            
            await supabase
              .from('processing_jobs')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                output_path: outputPath
              })
              .eq('id', jobId);

            resolve({ outputPath });
          } catch (error) {
            console.error('Error in post-processing:', error);
            await supabase
              .from('processing_jobs')
              .update({
                status: 'error',
                last_error: error.message
              })
              .eq('id', jobId);
            reject(error);
          }
        })
        .on('error', async (err) => {
          console.error('FFmpeg error:', err);
          await supabase
            .from('processing_jobs')
            .update({
              status: 'error',
              last_error: err.message
            })
            .eq('id', jobId);
          reject(err);
        });

      // Add filters based on parameters
      const filters = [];
      
      // Add overlay position
      const overlayPosition = getOverlayPosition(position);
      filters.push(`overlay=${overlayPosition}`);
      
      // Add greyscale if enabled
      if (greyscale) {
        filters.push('hue=s=0');
      }

      command
        .complexFilter(filters.join(','))
        .outputOptions('-c:a copy')
        .save(`output.${outputFormat}`);
    });
  } catch (error) {
    console.error('Error in video processing service:', error);
    await supabase
      .from('processing_jobs')
      .update({
        status: 'error',
        last_error: error.message
      })
      .eq('id', jobId);
    throw error;
  }
};

function getOverlayPosition(position: string): string {
  switch (position) {
    case 'top-left':
      return '10:10';
    case 'top-right':
      return 'main_w-overlay_w-10:10';
    case 'bottom':
      return '(main_w-overlay_w)/2:main_h-overlay_h-10';
    case 'center':
      return '(main_w-overlay_w)/2:(main_h-overlay_h)/2';
    default:
      return '10:10';
  }
}
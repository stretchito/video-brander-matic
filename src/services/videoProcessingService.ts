import path from 'path';
import fs from 'fs';
import { ensureUploadsDirectory } from '../utils/fileUtils';
import { createFFmpegCommand } from '../utils/ffmpegUtils';
import { uploadProcessedVideo } from '../utils/supabaseUtils';
import { supabase } from '../lib/supabase';

interface ProcessVideoOptions {
  videoPath: string;
  logoPath: string;
  position: string;
  greyscale: boolean;
  outputFormat: string;
  jobId: string;
}

export const processVideo = async (options: ProcessVideoOptions) => {
  const { videoPath, logoPath, position, greyscale, outputFormat, jobId } = options;
  const uploadsDir = ensureUploadsDirectory();
  const outputFileName = `processed/output_${Date.now()}.${outputFormat}`;
  const outputPath = path.join(uploadsDir, outputFileName);
  
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
      const command = createFFmpegCommand(videoPath, logoPath, outputPath, position, greyscale);

      command
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing progress:', progress);
        })
        .on('end', async () => {
          console.log('FFmpeg processing finished');
          try {
            const fileBuffer = await fs.promises.readFile(outputPath);
            const publicUrl = await uploadProcessedVideo(fileBuffer, outputFileName, `video/${outputFormat}`);

            await supabase
              .from('processing_jobs')
              .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                output_path: publicUrl
              })
              .eq('id', jobId);

            await fs.promises.unlink(outputPath);
            resolve({ outputPath: publicUrl });
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
        })
        .save(outputPath);
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
import path from 'path';
import fs from 'fs';
import { ensureUploadsDirectory, cleanupFile } from '../utils/fileUtils';
import { createFFmpegCommand } from '../utils/ffmpegUtils';
import { uploadProcessedVideo, updateJobProgress } from '../utils/supabaseUtils';

interface ProcessVideoOptions {
  videoPath: string;
  logoPath: string;
  position: string;
  greyscale: boolean;
  outputFormat: string;
  jobId?: string;
}

export const processVideo = async (options: ProcessVideoOptions) => {
  const { videoPath, logoPath, position, greyscale, outputFormat, jobId } = options;
  const uploadsDir = ensureUploadsDirectory();
  const outputFileName = `processed/output_${Date.now()}.${outputFormat}`;
  const outputPath = path.join(uploadsDir, outputFileName);
  
  try {
    console.log('Starting video processing with FFmpeg...', options);
    
    // Update initial status
    if (jobId) {
      await updateJobProgress(jobId, {
        status: 'processing',
        totalSteps: 3,
        completedSteps: 0,
        currentStep: 'Initializing video processing'
      });
    }

    return new Promise((resolve, reject) => {
      const command = createFFmpegCommand(
        videoPath,
        logoPath,
        outputPath,
        position,
        greyscale
      );

      let hasEnded = false;
      let hasErrored = false;

      command
        .on('start', async (commandLine) => {
          console.log('FFmpeg command:', commandLine);
          if (jobId) {
            await updateJobProgress(jobId, {
              completedSteps: 1,
              currentStep: 'Starting FFmpeg processing'
            });
          }
        })
        .on('progress', async (progress) => {
          console.log('Processing progress:', progress);
          if (jobId && !hasEnded && !hasErrored) {
            await updateJobProgress(jobId, {
              currentStep: `Processing: ${Math.round(progress.percent || 0)}% complete`
            });
          }
        })
        .on('end', async () => {
          console.log('FFmpeg processing finished');
          hasEnded = true;
          
          try {
            const fileBuffer = await fs.promises.readFile(outputPath);
            const publicUrl = await uploadProcessedVideo(
              fileBuffer,
              outputFileName,
              `video/${outputFormat}`
            );

            if (jobId) {
              await updateJobProgress(jobId, {
                completedSteps: 3,
                currentStep: 'Processing completed',
                status: 'completed',
                outputPath: publicUrl
              });
            }

            await cleanupFile(outputPath);
            resolve({ outputPath: publicUrl });
          } catch (error) {
            console.error('Error in post-processing:', error);
            if (jobId) {
              await updateJobProgress(jobId, {
                status: 'error',
                errorMessage: error.message
              });
            }
            reject(error);
          }
        })
        .on('error', async (err) => {
          console.error('FFmpeg error:', err);
          hasErrored = true;
          if (jobId) {
            await updateJobProgress(jobId, {
              status: 'error',
              errorMessage: err.message
            });
          }
          reject(err);
        })
        .save(outputPath);
    });
  } catch (error) {
    console.error('Error in video processing service:', error);
    if (jobId) {
      await updateJobProgress(jobId, {
        status: 'error',
        errorMessage: error.message
      });
    }
    throw error;
  }
};
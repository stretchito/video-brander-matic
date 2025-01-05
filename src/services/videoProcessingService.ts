import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { supabase } from '../lib/supabase';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  
  try {
    console.log('Starting video processing with FFmpeg...', options);
    
    const outputPath = path.join(__dirname, '../uploads', `output_${Date.now()}.${outputFormat}`);
    
    // Update job with initial progress
    if (jobId) {
      await updateJobProgress(jobId, {
        status: 'processing',
        totalSteps: 3,
        completedSteps: 0,
        currentStep: 'Initializing video processing'
      });
    }

    return new Promise((resolve, reject) => {
      let command = ffmpeg(videoPath)
        .input(logoPath)
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
          if (jobId) {
            await updateJobProgress(jobId, {
              currentStep: `Processing: ${Math.round(progress.percent || 0)}% complete`
            });
          }
        })
        .on('end', async () => {
          console.log('Processing finished');
          if (jobId) {
            await updateJobProgress(jobId, {
              completedSteps: 3,
              currentStep: 'Processing completed',
              status: 'completed'
            });
          }
          resolve({ outputPath });
        })
        .on('error', async (err) => {
          console.error('FFmpeg error:', err);
          if (jobId) {
            await updateJobProgress(jobId, {
              status: 'error',
              errorMessage: err.message
            });
          }
          reject(err);
        });

      // Add filters based on options
      const filters = [];
      
      // Add overlay filter
      filters.push({
        filter: 'overlay',
        options: getOverlayPosition(position),
        inputs: ['0:v', '1:v'],
        outputs: ['v']
      });

      // Add greyscale if enabled
      if (greyscale) {
        filters.push({
          filter: 'hue',
          options: { s: 0 },
          inputs: ['v'],
          outputs: ['out']
        });
      }

      // Apply filters
      command = command.complexFilter(filters);

      // Set output options and save
      command
        .outputOptions('-c:a copy')
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

async function updateJobProgress(jobId: string, update: {
  status?: string;
  completedSteps?: number;
  totalSteps?: number;
  currentStep?: string;
  errorMessage?: string;
}) {
  try {
    // Get current processing steps
    const { data: currentJob } = await supabase
      .from('processing_jobs')
      .select('processing_steps')
      .eq('id', jobId)
      .single();

    // Create new processing steps array
    const processingSteps = currentJob?.processing_steps || [];
    if (update.currentStep) {
      processingSteps.push(update.currentStep);
    }

    const { error } = await supabase
      .from('processing_jobs')
      .update({
        status: update.status,
        completed_steps: update.completedSteps,
        total_steps: update.totalSteps,
        processing_steps: processingSteps,
        error_message: update.errorMessage,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (error) {
      console.error('Error updating job progress:', error);
    }
  } catch (error) {
    console.error('Failed to update job progress:', error);
  }
}

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
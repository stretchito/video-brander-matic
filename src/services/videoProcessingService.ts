import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ProcessVideoOptions {
  videoPath: string;
  logoPath: string;
  position: string;
  greyscale: boolean;
  outputFormat: string;
}

export const processVideo = async (options: ProcessVideoOptions) => {
  const { videoPath, logoPath, position, greyscale, outputFormat } = options;
  
  try {
    console.log('Starting video processing with FFmpeg...', options);
    
    const outputPath = path.join(__dirname, '../uploads', `output_${Date.now()}.${outputFormat}`);
    
    return new Promise((resolve, reject) => {
      let command = ffmpeg(videoPath)
        .input(logoPath)
        .complexFilter([
          {
            filter: 'overlay',
            options: getOverlayPosition(position),
            inputs: ['0:v', '1:v'],
            outputs: ['v']
          },
          ...(greyscale ? [{
            filter: 'hue',
            options: { s: 0 },
            inputs: ['v'],
            outputs: ['out']
          }] : [])
        ])
        .outputOptions('-c:a copy')
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('Processing progress:', progress);
        })
        .on('end', () => {
          console.log('Processing finished');
          resolve({ outputPath });
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .save(outputPath);
    });
  } catch (error) {
    console.error('Error in video processing service:', error);
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
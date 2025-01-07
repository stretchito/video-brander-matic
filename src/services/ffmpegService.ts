import ffmpeg from 'fluent-ffmpeg';
import { getOverlayPosition } from '../utils/ffmpegUtils';

export const createFFmpegCommand = (
  inputPath: string,
  logoPath: string,
  position: string,
  greyscale: boolean
): ffmpeg.FfmpegCommand => {
  const command = ffmpeg(inputPath)
    .input(logoPath)
    .on('start', (commandLine: string) => {
      console.log('FFmpeg command:', commandLine);
    })
    .on('progress', (progress: any) => {
      console.log('Processing:', progress);
    });

  const filters: string[] = [];
  const overlayPosition = getOverlayPosition(position);
  filters.push(`overlay=${overlayPosition}`);
  
  if (greyscale) {
    filters.push('hue=s=0');
  }

  command
    .complexFilter(filters.join(','))
    .outputOptions('-c:a copy');

  return command;
};
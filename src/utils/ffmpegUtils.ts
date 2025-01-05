import ffmpeg from 'fluent-ffmpeg';

export const getOverlayPosition = (position: string): string => {
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
};

export const createFFmpegCommand = (
  inputPath: string,
  logoPath: string,
  outputPath: string,
  position: string,
  greyscale: boolean
): ffmpeg.FfmpegCommand => {
  console.log('Creating FFmpeg command with paths:', { inputPath, logoPath, outputPath });
  
  const filters = [];
  const overlayPosition = getOverlayPosition(position);
  
  filters.push({
    filter: 'overlay',
    options: overlayPosition,
    inputs: ['0:v', '1:v'],
    outputs: ['v']
  });

  if (greyscale) {
    filters.push({
      filter: 'hue',
      options: { s: 0 },
      inputs: ['v'],
      outputs: ['out']
    });
  }

  return ffmpeg(inputPath)
    .input(logoPath)
    .complexFilter(filters)
    .outputOptions('-c:a copy');
};
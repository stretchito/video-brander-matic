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
  
  // Verify input files exist
  console.log('Verifying input files...');
  
  const command = ffmpeg(inputPath)
    .input(logoPath)
    .on('start', (commandLine) => {
      console.log('FFmpeg command:', commandLine);
    })
    .on('progress', (progress) => {
      console.log('Processing:', {
        frames: progress.frames,
        currentFps: progress.currentFps,
        currentKbps: progress.currentKbps,
        targetSize: progress.targetSize,
        timemark: progress.timemark,
        percent: progress.percent
      });
    })
    .on('stderr', (stderrLine) => {
      console.log('FFmpeg stderr:', stderrLine);
    })
    .on('error', (err) => {
      console.error('FFmpeg processing error:', err);
    });

  const filters = [];
  const overlayPosition = getOverlayPosition(position);
  
  // Add overlay filter
  filters.push({
    filter: 'overlay',
    options: overlayPosition,
    inputs: ['0:v', '1:v'],
    outputs: ['v']
  });

  // Add greyscale filter if enabled
  if (greyscale) {
    filters.push({
      filter: 'hue',
      options: { s: 0 },
      inputs: ['v'],
      outputs: ['out']
    });
  }

  // Apply filters
  command.complexFilter(filters);

  // Set output options
  command
    .outputOptions('-c:a copy')
    .outputOptions('-movflags +faststart') // Enable streaming
    .outputOptions('-preset ultrafast')    // Faster encoding
    .outputOptions('-y');                  // Overwrite output file

  return command;
};
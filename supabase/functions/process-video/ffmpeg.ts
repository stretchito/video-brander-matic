import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7'

export const initializeFFmpeg = async () => {
  const ffmpeg = new FFmpeg();
  await ffmpeg.load({
    log: true,
    logger: ({ message }) => console.log('FFmpeg:', message),
    progress: ({ progress }) => console.log('FFmpeg progress:', progress),
    mainName: 'main',
    corePath: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/ffmpeg-core.js'
  });
  return ffmpeg;
};

export const calculateOverlayPosition = (position: string): string => {
  switch (position) {
    case 'top-right':
      return 'W-w-10:10';
    case 'bottom':
      return '10:H-h-10';
    case 'center':
      return '(W-w)/2:(H-h)/2';
    default:
      return '10:10'; // default top-left
  }
};

export const processVideoWithFFmpeg = async (
  ffmpeg: FFmpeg,
  options: {
    greyscale: boolean;
    position: string;
  }
) => {
  const filters = [];
  if (options.greyscale) {
    filters.push('hue=s=0');
  }
  filters.push(`[1:v]scale=100:100[logo]`);
  filters.push(`[0:v]${options.greyscale ? '[grey];[grey]' : ''}[logo]overlay=${calculateOverlayPosition(options.position)}`);

  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-i', 'logo.png',
    '-filter_complex', filters.join(';'),
    '-c:a', 'copy',
    'output.mp4'
  ]);
};
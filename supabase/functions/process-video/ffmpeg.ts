import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7';
import { toBlobURL } from 'https://esm.sh/@ffmpeg/util@0.12.1';

export async function initializeFFmpeg(): Promise<FFmpeg> {
  console.log('Initializing FFmpeg...');
  const ffmpeg = new FFmpeg();
  
  try {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
    });
    console.log('FFmpeg loaded successfully');
    return ffmpeg;
  } catch (error) {
    console.error('Error initializing FFmpeg:', error);
    throw new Error(`FFmpeg initialization error: ${error.message}`);
  }
}

export async function processVideo(
  ffmpeg: FFmpeg,
  videoData: Uint8Array,
  logoData: Uint8Array,
  position: string,
  greyscale: boolean,
  format: string
): Promise<Uint8Array> {
  console.log('Processing video with FFmpeg...');
  
  try {
    await ffmpeg.writeFile('input.mp4', videoData);
    await ffmpeg.writeFile('logo.png', logoData);
    console.log('Input files written successfully');

    const filters: string[] = [];
    const overlayPosition = getOverlayPosition(position);
    filters.push(`[0:v][1:v]overlay=${overlayPosition}:format=auto,format=yuv420p`);
    
    if (greyscale) {
      filters.push('hue=s=0');
    }

    const filterComplex = filters.join(',');
    console.log('Filter complex:', filterComplex);

    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-i', 'logo.png',
      '-filter_complex', filterComplex,
      '-c:a', 'copy',
      'output.' + format
    ]);

    const data = await ffmpeg.readFile('output.' + format);
    return new Uint8Array(data);
  } catch (error) {
    console.error('Error in video processing:', error);
    throw new Error(`Video processing error: ${error.message}`);
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
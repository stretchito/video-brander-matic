import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7';
import { toBlobURL } from 'https://esm.sh/@ffmpeg/util@0.12.1';

export async function processVideoWithFFmpeg(
  videoData: Uint8Array,
  logoData: Uint8Array,
  position: string,
  greyscale: boolean,
  outputFormat: string
): Promise<Blob> {
  console.log('Initializing FFmpeg...');
  const ffmpeg = new FFmpeg();
  
  try {
    // Load FFmpeg
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    console.log('FFmpeg loaded successfully');

    // Write input files
    await ffmpeg.writeFile('input.mp4', videoData);
    await ffmpeg.writeFile('logo.png', logoData);
    console.log('Input files written successfully');

    // Prepare FFmpeg command
    const filters: string[] = [];
    const overlayPosition = getOverlayPosition(position);
    filters.push(`[0:v][1:v]overlay=${overlayPosition}:format=auto,format=yuv420p`);
    
    if (greyscale) {
      filters.push('hue=s=0');
    }

    const filterComplex = filters.join(',');
    console.log('Filter complex:', filterComplex);

    // Execute FFmpeg command
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-i', 'logo.png',
      '-filter_complex', filterComplex,
      '-c:a', 'copy',
      'output.' + outputFormat
    ]);

    // Read output file
    const data = await ffmpeg.readFile('output.' + outputFormat);
    return new Blob([data], { type: `video/${outputFormat}` });
  } catch (error) {
    console.error('Error in FFmpeg processing:', error);
    throw new Error(`FFmpeg processing error: ${error.message}`);
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
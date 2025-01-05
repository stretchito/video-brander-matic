import { Command } from "https://deno.land/x/cmd@v1.2.0/mod.ts";

export async function processVideo(
  inputPath: string,
  logoPath: string,
  position: string,
  greyscale: boolean,
  format: string
): Promise<Uint8Array> {
  console.log('Processing video with FFmpeg...', { inputPath, logoPath, position, greyscale, format });

  try {
    const outputPath = `output.${format}`;
    const filters: string[] = [];
    const overlayPosition = getOverlayPosition(position);
    
    filters.push(`[0:v][1:v]overlay=${overlayPosition}:format=auto,format=yuv420p`);
    if (greyscale) {
      filters.push('hue=s=0');
    }

    const filterComplex = filters.join(',');
    console.log('Filter complex:', filterComplex);

    const ffmpegCommand = new Command('ffmpeg', [
      '-i', inputPath,
      '-i', logoPath,
      '-filter_complex', filterComplex,
      '-c:a', 'copy',
      outputPath
    ]);

    const { status } = await ffmpegCommand.spawn();
    
    if (!status.success) {
      throw new Error(`FFmpeg command failed with status: ${status.code}`);
    }

    const outputData = await Deno.readFile(outputPath);
    await Deno.remove(outputPath); // Clean up the output file
    
    return outputData;
  } catch (error) {
    console.error('Error in video processing:', error);
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
import { createFFmpeg } from '@ffmpeg/ffmpeg';

export async function processVideo(
  videoData: Uint8Array,
  logoData: Uint8Array,
  position: string,
  greyscale: boolean,
  outputFormat: string
): Promise<Uint8Array> {
  console.log('Initializing FFmpeg...');
  
  const ffmpeg = createFFmpeg({
    log: true,
    corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
  });

  try {
    console.log('Loading FFmpeg...');
    await ffmpeg.load();
    console.log('FFmpeg loaded successfully');

    // Write input files
    console.log('Writing input files...');
    ffmpeg.FS('writeFile', 'input.mp4', videoData);
    ffmpeg.FS('writeFile', 'logo.png', logoData);

    // Position mapping
    const logoPosition = {
      'top-left': '10:10',
      'top-right': 'W-w-10:10',
      'bottom': '(W-w)/2:H-h-10',
      'center': '(W-w)/2:(H-h)/2'
    }[position];

    // Build filter complex string
    const filterComplex = greyscale
      ? `[0:v]split=2[color][gray];[gray]colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3[grayscale];[grayscale][1:v]overlay=${logoPosition}[out]`
      : `[0:v][1:v]overlay=${logoPosition}[out]`;

    console.log('Processing video with filter:', filterComplex);

    // Process video with format-specific settings
    const outputName = `output.${outputFormat}`;
    const baseArgs = [
      '-i', 'input.mp4',
      '-i', 'logo.png',
      '-filter_complex', filterComplex,
      '-map', '[out]',
      '-map', '0:a?'
    ];

    if (outputFormat === 'webm') {
      await ffmpeg.run(
        ...baseArgs,
        '-c:v', 'libvpx',
        '-crf', '23',
        '-b:v', '1M',
        '-c:a', 'libvorbis',
        outputName
      );
    } else {
      // Default to MP4
      await ffmpeg.run(
        ...baseArgs,
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'aac',
        outputName
      );
    }

    console.log('FFmpeg processing completed');

    // Read the processed file
    console.log('Reading processed file...');
    const outputData = ffmpeg.FS('readFile', outputName);
    console.log('Output file read successfully');

    // Cleanup
    console.log('Cleaning up...');
    ffmpeg.FS('unlink', 'input.mp4');
    ffmpeg.FS('unlink', 'logo.png');
    ffmpeg.FS('unlink', outputName);

    return outputData;
  } catch (error) {
    console.error('Error in video processing:', error);
    throw new Error(`Video processing failed: ${error.message}`);
  }
}
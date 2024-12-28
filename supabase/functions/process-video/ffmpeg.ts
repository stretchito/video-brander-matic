import { createFFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.11.0';

export interface ProcessVideoOptions {
  inputPath: string;
  logoPath: string;
  outputPath: string;
  position: string;
  greyscale: boolean;
  outputFormat: string;
}

export async function processVideo({
  inputPath,
  logoPath,
  outputPath,
  position,
  greyscale,
  outputFormat
}: ProcessVideoOptions) {
  console.log('Initializing FFmpeg...');
  const ffmpeg = createFFmpeg({ 
    log: true,
    corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
  });
  
  try {
    console.log('Loading FFmpeg...');
    await ffmpeg.load();
    console.log('FFmpeg loaded successfully');

    // Read input files
    console.log('Reading input files...');
    const videoData = await Deno.readFile(inputPath);
    const logoData = await Deno.readFile(logoPath);

    // Write files to FFMPEG's virtual filesystem
    console.log('Writing files to FFmpeg filesystem...');
    ffmpeg.FS('writeFile', 'input.mp4', videoData);
    ffmpeg.FS('writeFile', 'logo.png', logoData);

    // Prepare filter complex based on options
    let filterComplex = '';
    
    // Position mapping
    const logoPosition = {
      'top-left': '10:10',
      'top-right': 'main_w-overlay_w-10:10',
      'bottom': '(main_w-overlay_w)/2:main_h-overlay_h-10',
      'center': '(main_w-overlay_w)/2:(main_h-overlay_h)/2'
    }[position];

    // Build filter complex string
    if (greyscale) {
      filterComplex = `[0:v]split=2[color][gray];[gray]colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3[grayscale];[grayscale][1:v]overlay=${logoPosition}[out]`;
    } else {
      filterComplex = `[0:v][1:v]overlay=${logoPosition}[out]`;
    }

    console.log('Processing video with filter:', filterComplex);

    // Process video
    const outputName = `output.${outputFormat}`;
    const args = [
      '-i', 'input.mp4',
      '-i', 'logo.png',
      '-filter_complex', filterComplex,
      '-map', '[out]',
      '-map', '0:a?'
    ];

    // Add format-specific settings
    if (outputFormat === 'mp4') {
      args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '23');
      args.push('-c:a', 'aac', '-b:a', '128k');
    } else if (outputFormat === 'webm') {
      args.push('-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '0');
      args.push('-c:a', 'libopus');
    }

    args.push(outputName);

    // Run FFMPEG
    console.log('Running FFmpeg with args:', args);
    await ffmpeg.run(...args);
    console.log('FFmpeg processing completed');

    // Read the processed file
    console.log('Reading processed file...');
    const data = ffmpeg.FS('readFile', outputName);
    
    // Write to output path
    console.log('Writing output file...');
    await Deno.writeFile(outputPath, data);

    // Clean up FFMPEG's virtual filesystem
    console.log('Cleaning up FFmpeg filesystem...');
    ffmpeg.FS('unlink', 'input.mp4');
    ffmpeg.FS('unlink', 'logo.png');
    ffmpeg.FS('unlink', outputName);

    console.log('Video processing completed successfully');
  } catch (error) {
    console.error('Error in processVideo:', error);
    throw error;
  }
}
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
  const ffmpegArgs = [];
  
  // Base input
  ffmpegArgs.push('-i', inputPath);
  ffmpegArgs.push('-i', logoPath);
  
  // Set filter complex based on position and greyscale
  let filterComplex = '';
  
  // Apply greyscale if needed
  if (greyscale) {
    filterComplex += '[0:v]split=2[color][gray];[gray]colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3[grayscale];';
  }
  
  // Position the logo
  const logoPosition = {
    'top-left': '10:10',
    'top-right': 'main_w-overlay_w-10:10',
    'bottom': '(main_w-overlay_w)/2:main_h-overlay_h-10',
    'center': '(main_w-overlay_w)/2:(main_h-overlay_h)/2'
  }[position];
  
  // Complete the filter complex
  if (greyscale) {
    filterComplex += `[grayscale][1:v]overlay=${logoPosition}[out]`;
  } else {
    filterComplex += `[0:v][1:v]overlay=${logoPosition}[out]`;
  }
  
  ffmpegArgs.push('-filter_complex', filterComplex);
  ffmpegArgs.push('-map', '[out]');
  ffmpegArgs.push('-map', '0:a?');
  
  // Set output format
  if (outputFormat === 'mp4') {
    ffmpegArgs.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '23');
    ffmpegArgs.push('-c:a', 'aac', '-b:a', '128k');
  } else if (outputFormat === 'webm') {
    ffmpegArgs.push('-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '0');
    ffmpegArgs.push('-c:a', 'libopus');
  }
  
  ffmpegArgs.push('-y', outputPath);
  
  const ffmpeg = new Deno.Command('ffmpeg', {
    args: ffmpegArgs,
  });
  
  const { code, stderr } = await ffmpeg.output();
  
  if (code !== 0) {
    throw new Error(`FFMPEG error: ${new TextDecoder().decode(stderr)}`);
  }
}
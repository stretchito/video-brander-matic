import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { decode as base64Decode } from "https://deno.land/std/encoding/base64.ts";
import { ensureDir } from "https://deno.land/std/fs/ensure_dir.ts";
import { join } from "https://deno.land/std/path/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessVideoPayload {
  jobId: string;
  videoPath: string;
  logoPath: string;
  position: string;
  greyscale: boolean;
  outputFormat: string;
}

async function downloadFile(url: string, filePath: string) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  await Deno.writeFile(filePath, new Uint8Array(arrayBuffer));
}

async function processVideo(
  inputPath: string,
  logoPath: string,
  outputPath: string,
  position: string,
  greyscale: boolean,
  outputFormat: string
) {
  const ffmpegArgs = [];
  
  // Base input
  ffmpegArgs.push('-i', inputPath);
  
  // Add logo input
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
  
  // Output path
  ffmpegArgs.push('-y', outputPath);
  
  const ffmpeg = new Deno.Command('ffmpeg', {
    args: ffmpegArgs,
  });
  
  const { code, stderr } = await ffmpeg.output();
  
  if (code !== 0) {
    throw new Error(`FFMPEG error: ${new TextDecoder().decode(stderr)}`);
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request payload
    const payload: ProcessVideoPayload = await req.json();
    const { jobId, videoPath, logoPath, position, greyscale, outputFormat } = payload;

    console.log('Starting video processing job:', jobId);

    try {
      // Update job status to processing
      await supabaseClient
        .from('processing_jobs')
        .update({ status: 'processing' })
        .eq('id', jobId);

      // Create temp directory
      const tempDir = await Deno.makeTempDir();
      console.log('Created temp directory:', tempDir);

      // Download files from storage
      const inputVideoPath = join(tempDir, `input.${videoPath.split('.').pop()}`);
      const inputLogoPath = join(tempDir, `logo.${logoPath.split('.').pop()}`);
      const outputVideoPath = join(tempDir, `output.${outputFormat}`);

      console.log('Downloading video file...');
      const { data: videoUrl } = await supabaseClient.storage
        .from('videos')
        .createSignedUrl(videoPath, 60);
      
      if (!videoUrl?.signedUrl) throw new Error('Failed to get video URL');
      await downloadFile(videoUrl.signedUrl, inputVideoPath);

      console.log('Downloading logo file...');
      const { data: logoUrl } = await supabaseClient.storage
        .from('logos')
        .createSignedUrl(logoPath, 60);
      
      if (!logoUrl?.signedUrl) throw new Error('Failed to get logo URL');
      await downloadFile(logoUrl.signedUrl, inputLogoPath);

      // Process the video
      console.log('Processing video...');
      await processVideo(
        inputVideoPath,
        inputLogoPath,
        outputVideoPath,
        position,
        greyscale,
        outputFormat
      );

      // Upload processed video
      console.log('Uploading processed video...');
      const outputPath = `processed/${jobId}.${outputFormat}`;
      const fileBuffer = await Deno.readFile(outputVideoPath);
      
      const { error: uploadError } = await supabaseClient.storage
        .from('videos')
        .upload(outputPath, fileBuffer, {
          contentType: `video/${outputFormat}`,
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Clean up temp files
      await Deno.remove(tempDir, { recursive: true });

      // Update job as completed
      await supabaseClient
        .from('processing_jobs')
        .update({
          status: 'completed',
          output_path: outputPath
        })
        .eq('id', jobId);

      console.log('Video processing completed successfully');

      return new Response(
        JSON.stringify({ success: true, message: 'Video processed successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.error('Processing error:', error);

      // Update job with error status
      await supabaseClient
        .from('processing_jobs')
        .update({
          status: 'error',
          error_message: error.message
        })
        .eq('id', jobId);

      throw error;
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
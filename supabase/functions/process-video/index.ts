import { join } from "https://deno.land/std/path/mod.ts";
import { processVideo } from "./ffmpeg.ts";
import { downloadFile, cleanupTempFiles } from "./file-utils.ts";
import { createSupabaseClient, getSignedUrl, uploadProcessedVideo, updateJobStatus } from "./supabase-client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface ProcessVideoPayload {
  jobId: string;
  videoPath: string;
  logoPath: string;
  position: string;
  greyscale: boolean;
  outputFormat: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.error('Invalid method:', req.method);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  try {
    console.log('Starting video processing request');
    const supabaseClient = createSupabaseClient();
    const payload: ProcessVideoPayload = await req.json();
    const { jobId, videoPath, logoPath, position, greyscale, outputFormat } = payload;

    console.log('Processing job:', jobId, 'with video:', videoPath);

    try {
      // Update job status to processing
      await updateJobStatus(supabaseClient, jobId, 'processing');
      console.log('Updated job status to processing');

      // Create temp directory and set up file paths
      const tempDir = await Deno.makeTempDir();
      console.log('Created temp directory:', tempDir);

      const inputVideoPath = join(tempDir, `input.${videoPath.split('.').pop()}`);
      const inputLogoPath = join(tempDir, `logo.${logoPath.split('.').pop()}`);
      const outputVideoPath = join(tempDir, `output.${outputFormat}`);

      // Download files
      console.log('Downloading video file...');
      const videoUrl = await getSignedUrl(supabaseClient, 'videos', videoPath);
      await downloadFile(videoUrl, inputVideoPath);

      console.log('Downloading logo file...');
      const logoUrl = await getSignedUrl(supabaseClient, 'logos', logoPath);
      await downloadFile(logoUrl, inputLogoPath);

      // Process video
      console.log('Processing video...');
      await processVideo({
        inputPath: inputVideoPath,
        logoPath: inputLogoPath,
        outputPath: outputVideoPath,
        position,
        greyscale,
        outputFormat
      });

      // Upload processed video
      console.log('Uploading processed video...');
      const outputPath = `processed/${jobId}.${outputFormat}`;
      const fileBuffer = await Deno.readFile(outputVideoPath);
      
      await uploadProcessedVideo(
        supabaseClient,
        outputPath,
        fileBuffer,
        `video/${outputFormat}`
      );

      // Clean up temp files
      await cleanupTempFiles(tempDir);
      console.log('Cleaned up temporary files');

      // Update job as completed
      await updateJobStatus(supabaseClient, jobId, 'completed', outputPath);
      console.log('Job completed successfully');

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Video processed successfully',
          outputPath 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );

    } catch (error) {
      console.error('Processing error:', error);
      await updateJobStatus(supabaseClient, jobId, 'error', undefined, error.message);
      throw error;
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        type: error.name 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
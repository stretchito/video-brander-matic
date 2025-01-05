import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { downloadFile, uploadFile } from './storage.ts';
import { processVideoWithFFmpeg } from './ffmpeg.ts';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received video processing request');
    const { videoPath, logoPath, position, greyscale, outputFormat } = await req.json();

    console.log('Request parameters:', {
      videoPath,
      logoPath,
      position,
      greyscale,
      outputFormat
    });

    // Download files from storage
    console.log('Downloading video file...');
    const videoData = await downloadFile('videos', videoPath);
    console.log('Video file downloaded successfully');

    console.log('Downloading logo file...');
    const logoData = await downloadFile('logos', logoPath);
    console.log('Logo file downloaded successfully');

    // Process video with FFmpeg
    console.log('Processing video with FFmpeg...');
    const processedVideo = await processVideoWithFFmpeg(
      videoData,
      logoData,
      position,
      greyscale,
      outputFormat
    );
    console.log('Video processing completed');

    // Upload processed video
    const outputPath = `processed/${Date.now()}_output.${outputFormat}`;
    console.log('Uploading processed video...');
    const finalVideoUrl = await uploadFile('videos', outputPath, processedVideo);
    console.log('Upload completed. Final URL:', finalVideoUrl);

    return new Response(
      JSON.stringify({
        success: true,
        finalVideoUrl
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error in process-video function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
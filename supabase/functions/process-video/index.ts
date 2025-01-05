import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateRequest } from "./validation.ts";
import { downloadFile, uploadFile } from "./storage.ts";
import { initializeFFmpeg, processVideo } from "./ffmpeg.ts";

const corsHeaders = {
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
    const requestData = await req.json();
    
    // Validate request data
    const { videoPath, logoPath, position, greyscale, format } = validateRequest(requestData);
    console.log('Request validation passed:', { videoPath, logoPath, position, greyscale, format });

    // Download files
    console.log('Downloading files...');
    const videoData = await downloadFile('videos', videoPath);
    const logoData = await downloadFile('logos', logoPath);
    console.log('Files downloaded successfully');

    // Initialize and process with FFmpeg
    const ffmpeg = await initializeFFmpeg();
    const processedData = await processVideo(ffmpeg, videoData, logoData, position, greyscale, format);
    const processedBlob = new Blob([processedData], { type: `video/${format}` });

    // Upload result
    const outputPath = `processed/${Date.now()}_output.${format}`;
    const finalVideoUrl = await uploadFile('videos', outputPath, processedBlob);
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
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
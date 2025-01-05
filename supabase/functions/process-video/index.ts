import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateRequest } from "./validation.ts";
import { downloadFile, uploadFile } from "./storage.ts";
import { processVideo } from "./ffmpeg.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received video processing request');
    const requestData = await req.json();
    
    const { videoPath, logoPath, position, greyscale, format } = validateRequest(requestData);
    console.log('Request validation passed:', { videoPath, logoPath, position, greyscale, format });

    // Create temporary files for processing
    const tempVideoPath = await Deno.makeTempFile();
    const tempLogoPath = await Deno.makeTempFile();

    try {
      // Download files to temp locations
      console.log('Downloading files...');
      const videoData = await downloadFile('videos', videoPath);
      const logoData = await downloadFile('logos', logoPath);
      
      await Deno.writeFile(tempVideoPath, videoData);
      await Deno.writeFile(tempLogoPath, logoData);
      console.log('Files downloaded and saved to temp locations');

      // Process the video
      const processedData = await processVideo(
        tempVideoPath,
        tempLogoPath,
        position,
        greyscale,
        format
      );

      // Upload result
      const outputPath = `processed/${Date.now()}_output.${format}`;
      const processedBlob = new Blob([processedData], { type: `video/${format}` });
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
    } finally {
      // Clean up temp files
      try {
        await Deno.remove(tempVideoPath);
        await Deno.remove(tempLogoPath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp files:', cleanupError);
      }
    }
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
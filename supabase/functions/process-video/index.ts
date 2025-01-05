import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { validateRequest } from './validation.ts';
import { processVideoWithFFmpeg } from './ffmpeg.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function downloadFile(supabase: any, bucketName: string, filePath: string): Promise<Uint8Array> {
  console.log(`Attempting to download file from bucket: ${bucketName}, path: ${filePath}`);
  
  if (!filePath) {
    throw new Error('File path is required');
  }

  try {
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      console.error('Error downloading file:', error);
      throw new Error(`Error downloading file: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data received from storage');
    }

    return new Uint8Array(await data.arrayBuffer());
  } catch (error) {
    console.error('Error in downloadFile:', error);
    throw error;
  }
}

async function uploadFile(supabase: any, bucketName: string, filePath: string, file: Blob): Promise<string> {
  console.log(`Uploading file to bucket: ${bucketName}, path: ${filePath}`);
  
  try {
    const { error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received video processing request');
    const requestData = await req.json();
    
    // Validate request data
    const { videoPath, logoPath, position, greyscale, outputFormat } = validateRequest(requestData);
    console.log('Request validation passed:', { videoPath, logoPath, position, greyscale, outputFormat });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Download files
    console.log('Downloading files...');
    const videoData = await downloadFile(supabase, 'videos', videoPath);
    const logoData = await downloadFile(supabase, 'logos', logoPath);
    console.log('Files downloaded successfully');

    // Process video
    console.log('Processing video...');
    const processedVideo = await processVideoWithFFmpeg(
      videoData,
      logoData,
      position,
      greyscale,
      outputFormat
    );
    console.log('Video processing completed');

    // Upload result
    const outputPath = `processed/${Date.now()}_output.${outputFormat}`;
    const finalVideoUrl = await uploadFile(supabase, 'videos', outputPath, processedVideo);
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
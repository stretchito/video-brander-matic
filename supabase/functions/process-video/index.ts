import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7';
import { toBlobURL } from 'https://esm.sh/@ffmpeg/util@0.12.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function downloadFile(supabase: any, bucketName: string, filePath: string): Promise<Uint8Array> {
  console.log(`Downloading file from bucket: ${bucketName}, path: ${filePath}`);
  
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received video processing request');
    const requestData = await req.json();
    
    // Validate request data
    const { videoPath, logoPath, position, greyscale, format } = requestData;
    
    if (!videoPath) {
      throw new Error('Video path is required');
    }
    if (!logoPath) {
      throw new Error('Logo path is required');
    }
    if (!position) {
      throw new Error('Position is required');
    }
    if (!format) {
      throw new Error('Output format is required');
    }

    console.log('Request validation passed:', { videoPath, logoPath, position, greyscale, format });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Download files
    console.log('Downloading files...');
    const videoData = await downloadFile(supabase, 'videos', videoPath);
    const logoData = await downloadFile(supabase, 'logos', logoPath);
    console.log('Files downloaded successfully');

    // Initialize FFmpeg
    console.log('Initializing FFmpeg...');
    const ffmpeg = new FFmpeg();
    
    try {
      // Load FFmpeg
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      console.log('FFmpeg loaded successfully');

      // Write input files
      await ffmpeg.writeFile('input.mp4', videoData);
      await ffmpeg.writeFile('logo.png', logoData);
      console.log('Input files written successfully');

      // Prepare FFmpeg command
      const filters: string[] = [];
      const overlayPosition = getOverlayPosition(position);
      filters.push(`[0:v][1:v]overlay=${overlayPosition}:format=auto,format=yuv420p`);
      
      if (greyscale) {
        filters.push('hue=s=0');
      }

      const filterComplex = filters.join(',');
      console.log('Filter complex:', filterComplex);

      // Execute FFmpeg command
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-i', 'logo.png',
        '-filter_complex', filterComplex,
        '-c:a', 'copy',
        'output.' + format
      ]);

      // Read output file
      const processedData = await ffmpeg.readFile('output.' + format);
      const processedBlob = new Blob([processedData], { type: `video/${format}` });

      // Upload result
      const outputPath = `processed/${Date.now()}_output.${format}`;
      const finalVideoUrl = await uploadFile(supabase, 'videos', outputPath, processedBlob);
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

    } catch (ffmpegError) {
      console.error('Error in FFmpeg processing:', ffmpegError);
      throw new Error(`FFmpeg processing error: ${ffmpegError.message}`);
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
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7';
import { toBlobURL } from 'https://esm.sh/@ffmpeg/util@0.12.1';
import { downloadFile, uploadFile } from './storage.ts';

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

    // Validate required paths
    if (!videoPath || !logoPath) {
      console.error('Missing required paths:', { videoPath, logoPath });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required paths'
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

    // Initialize FFmpeg
    console.log('Initializing FFmpeg...');
    const ffmpeg = new FFmpeg();
    
    // Load FFmpeg
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    console.log('FFmpeg loaded successfully');

    // Write input files
    console.log('Writing input files...');
    await ffmpeg.writeFile('input.mp4', videoData);
    await ffmpeg.writeFile('logo.png', logoData);
    console.log('Input files written successfully');

    // Prepare FFmpeg command
    const filters: string[] = [];
    
    // Add logo overlay filter based on position
    const overlayPosition = getOverlayPosition(position);
    filters.push(`[0:v][1:v]overlay=${overlayPosition}:format=auto,format=yuv420p`);
    
    // Add greyscale filter if enabled
    if (greyscale) {
      filters.push('hue=s=0');
    }

    const filterComplex = filters.join(',');
    console.log('Filter complex:', filterComplex);

    // Execute FFmpeg command
    console.log('Executing FFmpeg command...');
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-i', 'logo.png',
      '-filter_complex', filterComplex,
      '-c:a', 'copy',
      'output.' + outputFormat
    ]);
    console.log('FFmpeg command executed successfully');

    // Read output file
    console.log('Reading output file...');
    const data = await ffmpeg.readFile('output.' + outputFormat);
    console.log('Output file read successfully');

    // Convert to Blob
    const processedVideo = new Blob([data], { type: `video/${outputFormat}` });
    console.log('Video processing completed successfully');

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
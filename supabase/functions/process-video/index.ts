import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { initializeFFmpeg, processVideoWithFFmpeg } from './ffmpeg.ts'
import { initializeSupabase, downloadFile, uploadProcessedVideo } from './storage.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoPath, logoPath, position = 'top-left', greyscale = false, format = 'mp4' } = await req.json();
    console.log('Processing request received:', { videoPath, logoPath, position, greyscale, format });

    if (!videoPath || !logoPath) {
      throw new Error('Missing required paths');
    }

    const supabase = initializeSupabase();
    console.log('Supabase client initialized');

    // Download files
    console.log('Attempting to download video file...');
    const videoData = await downloadFile(supabase, 'videos', videoPath);
    console.log('Video file downloaded successfully');

    console.log('Attempting to download logo file...');
    const logoData = await downloadFile(supabase, 'logos', logoPath);
    console.log('Logo file downloaded successfully');

    // Initialize FFmpeg
    console.log('Initializing FFmpeg...');
    const ffmpeg = await initializeFFmpeg();
    console.log('FFmpeg initialized successfully');

    // Write input files
    console.log('Writing input files to FFmpeg...');
    await ffmpeg.writeFile('input.mp4', new Uint8Array(await videoData.arrayBuffer()));
    await ffmpeg.writeFile('logo.png', new Uint8Array(await logoData.arrayBuffer()));
    console.log('Input files written successfully');

    // Process video
    console.log('Starting video processing...');
    await processVideoWithFFmpeg(ffmpeg, { greyscale, position });
    console.log('Video processing completed');

    // Read and upload processed file
    console.log('Reading processed file...');
    const outputData = await ffmpeg.readFile('output.mp4');
    console.log('Processed file read successfully');
    
    console.log('Uploading processed video...');
    const { outputPath, publicUrl } = await uploadProcessedVideo(supabase, outputData, format);
    console.log('Upload completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Video processed successfully',
        outputPath,
        publicUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing video:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
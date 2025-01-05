import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { initializeFFmpeg, processVideoWithFFmpeg } from './ffmpeg.ts'
import { initializeSupabase, downloadFile, uploadProcessedVideo } from './storage.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoPath, logoPath, position = 'top-left', greyscale = false, format = 'mp4' } = await req.json();
    console.log('Processing video:', { videoPath, logoPath, position, greyscale, format });

    const supabase = initializeSupabase();

    // Download files
    console.log('Downloading files...');
    const videoData = await downloadFile(supabase, 'videos', videoPath);
    const logoData = await downloadFile(supabase, 'logos', logoPath);

    // Initialize FFmpeg
    console.log('Initializing FFmpeg...');
    const ffmpeg = await initializeFFmpeg();

    // Write input files
    console.log('Writing input files...');
    await ffmpeg.writeFile('input.mp4', new Uint8Array(await videoData.arrayBuffer()));
    await ffmpeg.writeFile('logo.png', new Uint8Array(await logoData.arrayBuffer()));

    // Process video
    console.log('Processing video...');
    await processVideoWithFFmpeg(ffmpeg, { greyscale, position });

    // Read and upload processed file
    console.log('Reading processed file...');
    const outputData = await ffmpeg.readFile('output.mp4');
    
    console.log('Uploading processed video...');
    const { outputPath, publicUrl } = await uploadProcessedVideo(supabase, outputData, format);

    console.log('Processing completed successfully');
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
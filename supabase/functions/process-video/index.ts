import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7'
import { fetchFile } from 'https://esm.sh/@ffmpeg/util@0.12.1'

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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Download video file
    console.log('Downloading video file...');
    const { data: videoData, error: videoError } = await supabase
      .storage
      .from('videos')
      .download(videoPath);

    if (videoError) {
      console.error('Video download error:', videoError);
      throw new Error(`Error downloading video: ${videoError.message}`);
    }

    // Download logo file
    console.log('Downloading logo file...');
    const { data: logoData, error: logoError } = await supabase
      .storage
      .from('logos')
      .download(logoPath);

    if (logoError) {
      console.error('Logo download error:', logoError);
      throw new Error(`Error downloading logo: ${logoError.message}`);
    }

    // Initialize FFmpeg
    console.log('Initializing FFmpeg...');
    const ffmpeg = new FFmpeg();
    
    console.log('Loading FFmpeg...');
    await ffmpeg.load({
      log: true,
      logger: ({ message }) => console.log('FFmpeg:', message),
      progress: ({ progress }) => console.log('FFmpeg progress:', progress),
      mainName: 'main',
      corePath: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/ffmpeg-core.js'
    });

    // Write input files
    console.log('Writing input files...');
    const videoBuffer = await videoData.arrayBuffer();
    const logoBuffer = await logoData.arrayBuffer();
    
    await ffmpeg.writeFile('input.mp4', new Uint8Array(videoBuffer));
    await ffmpeg.writeFile('logo.png', new Uint8Array(logoBuffer));

    // Calculate logo position
    let overlayPosition = '10:10'; // default top-left
    switch (position) {
      case 'top-right':
        overlayPosition = 'W-w-10:10';
        break;
      case 'bottom':
        overlayPosition = '10:H-h-10';
        break;
      case 'center':
        overlayPosition = '(W-w)/2:(H-h)/2';
        break;
    }

    // Build FFmpeg command
    const filters = [];
    if (greyscale) {
      filters.push('hue=s=0'); // Apply greyscale effect
    }
    filters.push(`[1:v]scale=100:100[logo]`); // Scale logo
    filters.push(`[0:v]${greyscale ? '[grey];[grey]' : ''}[logo]overlay=${overlayPosition}`); // Add logo overlay

    console.log('Processing video...');
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-i', 'logo.png',
      '-filter_complex', filters.join(';'),
      '-c:a', 'copy',
      'output.mp4'
    ]);

    console.log('Reading processed file...');
    const outputData = await ffmpeg.readFile('output.mp4');
    
    const outputPath = `processed/${crypto.randomUUID()}.${format}`;

    console.log('Uploading processed video...');
    const { error: uploadError } = await supabase
      .storage
      .from('videos')
      .upload(outputPath, outputData, {
        contentType: 'video/mp4',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Error uploading processed video: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('videos')
      .getPublicUrl(outputPath);

    console.log('Processing completed successfully');
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Video processed successfully',
        outputPath,
        publicUrl
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error processing video:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});
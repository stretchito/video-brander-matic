import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { FFmpeg } from 'https://esm.sh/@ffmpeg/ffmpeg@0.12.7/dist/esm/index.js'
import { fetchFile } from 'https://esm.sh/@ffmpeg/util@0.12.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { videoPath, logoPath } = await req.json()
    console.log('Processing video:', videoPath)
    console.log('Using logo:', logoPath)

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Download files from Supabase Storage
    console.log('Downloading video file...')
    const { data: videoData, error: videoError } = await supabase
      .storage
      .from('videos')
      .download(videoPath)

    if (videoError) {
      console.error('Video download error:', videoError)
      throw new Error(`Error downloading video: ${videoError.message}`)
    }

    console.log('Downloading logo file...')
    const { data: logoData, error: logoError } = await supabase
      .storage
      .from('logos')
      .download(logoPath)

    if (logoError) {
      console.error('Logo download error:', logoError)
      throw new Error(`Error downloading logo: ${logoError.message}`)
    }

    // Initialize FFmpeg
    console.log('Initializing FFmpeg...')
    const ffmpeg = new FFmpeg()
    
    // Configure FFmpeg to not use SharedArrayBuffer
    ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg log:', message)
    })

    // Load FFmpeg
    console.log('Loading FFmpeg...')
    await ffmpeg.load({
      coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm/ffmpeg-core.js'
    })

    console.log('Writing input files...')
    // Write input files
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoData))
    await ffmpeg.writeFile('logo.png', await fetchFile(logoData))

    // Process video with logo overlay
    console.log('Processing video...')
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-i', 'logo.png',
      '-filter_complex', '[1:v]scale=100:100[logo];[0:v][logo]overlay=10:10',
      '-c:a', 'copy',
      'output.mp4'
    ])

    // Read the output file
    console.log('Reading processed file...')
    const outputData = await ffmpeg.readFile('output.mp4')
    
    // Generate output path
    const outputPath = `processed/${crypto.randomUUID()}.mp4`

    // Upload processed video back to Supabase Storage
    console.log('Uploading processed video...')
    const { error: uploadError } = await supabase
      .storage
      .from('videos')
      .upload(outputPath, outputData, {
        contentType: 'video/mp4',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Error uploading processed video: ${uploadError.message}`)
    }

    // Get public URL for the processed video
    const { data: { publicUrl } } = supabase
      .storage
      .from('videos')
      .getPublicUrl(outputPath)

    console.log('Processing completed successfully')
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
    )
  } catch (error) {
    console.error('Error processing video:', error)
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
    )
  }
})
import { createClient } from "https://esm.sh/v2/@supabase/supabase-js@2.7.1";
import { v2 as cloudinary } from "https://esm.sh/cloudinary@1.41.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface ProcessVideoPayload {
  jobId: string;
  videoPath: string;
  logoPath: string;
  position: string;
  greyscale: boolean;
  outputFormat: string;
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: Deno.env.get('CLOUDINARY_CLOUD_NAME'),
  api_key: Deno.env.get('CLOUDINARY_API_KEY'),
  api_secret: Deno.env.get('CLOUDINARY_API_SECRET'),
});

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    console.log('Starting video processing request');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const payload: ProcessVideoPayload = await req.json();
    console.log('Received payload:', JSON.stringify(payload));
    
    const { jobId, videoPath, logoPath, position, greyscale, outputFormat } = payload;

    try {
      // Update job status to processing
      await updateJobStatus(supabaseClient, jobId, 'processing');
      console.log('Updated job status to processing');

      // Get signed URLs for video and logo
      const videoUrl = await getSignedUrl(supabaseClient, 'videos', videoPath);
      const logoUrl = await getSignedUrl(supabaseClient, 'logos', logoPath);

      // Upload video to Cloudinary
      console.log('Uploading video to Cloudinary...');
      const videoUpload = await cloudinary.uploader.upload(videoUrl, {
        resource_type: 'video',
        public_id: `temp_${jobId}_video`,
      });

      // Upload logo to Cloudinary
      console.log('Uploading logo to Cloudinary...');
      const logoUpload = await cloudinary.uploader.upload(logoUrl, {
        public_id: `temp_${jobId}_logo`,
      });

      // Define transformation based on position and greyscale
      const transformations = [];
      
      // Add greyscale if enabled
      if (greyscale) {
        transformations.push({ effect: 'grayscale' });
      }

      // Add logo overlay with position
      const overlayPosition = getOverlayPosition(position);
      transformations.push({
        overlay: `l_${logoUpload.public_id}`,
        ...overlayPosition,
      });

      // Process video with Cloudinary
      console.log('Processing video with Cloudinary...');
      const result = await cloudinary.video.upload(videoUpload.secure_url, {
        resource_type: 'video',
        public_id: `processed_${jobId}`,
        transformation: transformations,
        format: outputFormat,
      });

      // Clean up temporary uploads
      await Promise.all([
        cloudinary.uploader.destroy(`temp_${jobId}_video`),
        cloudinary.uploader.destroy(`temp_${jobId}_logo`),
      ]);

      // Update job as completed
      await updateJobStatus(supabaseClient, jobId, 'completed', result.secure_url);
      console.log('Job completed successfully');

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Video processed successfully',
          outputUrl: result.secure_url 
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      );

    } catch (error) {
      console.error('Processing error:', error);
      await updateJobStatus(supabaseClient, jobId, 'error', undefined, error.message);
      throw error;
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred during video processing'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

// Helper function to get signed URLs from Supabase
async function getSignedUrl(supabaseClient: any, bucket: string, path: string) {
  console.log(`Getting signed URL for ${bucket}/${path}`);
  const { data: url, error } = await supabaseClient.storage
    .from(bucket)
    .createSignedUrl(path, 60);
  
  if (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
  
  return url.signedUrl;
}

// Helper function to update job status
async function updateJobStatus(
  supabaseClient: any, 
  jobId: string, 
  status: string, 
  outputPath?: string, 
  errorMessage?: string
) {
  console.log(`Updating job ${jobId} status to ${status}`);
  const updates: any = { status };
  if (outputPath) updates.output_path = outputPath;
  if (errorMessage) updates.error_message = errorMessage;

  const { error } = await supabaseClient
    .from('processing_jobs')
    .update(updates)
    .eq('id', jobId);

  if (error) {
    console.error('Error updating job status:', error);
    throw error;
  }
}

// Helper function to get overlay position parameters for Cloudinary
function getOverlayPosition(position: string) {
  switch (position) {
    case 'top-left':
      return { gravity: 'north_west', x: 10, y: 10 };
    case 'top-right':
      return { gravity: 'north_east', x: 10, y: 10 };
    case 'bottom':
      return { gravity: 'south', y: 10 };
    case 'center':
      return { gravity: 'center' };
    default:
      return { gravity: 'north_west', x: 10, y: 10 };
  }
}
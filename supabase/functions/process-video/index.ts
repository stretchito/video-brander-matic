import { ProcessVideoPayload, corsHeaders } from './types.ts';
import { getSignedUrl, updateJobStatus } from './supabase-helpers.ts';
import { 
  uploadToCloudinary, 
  processVideo, 
  deleteFromCloudinary, 
  getOverlayPosition 
} from './cloudinary.ts';

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
    
    // Parse request body
    const payload: ProcessVideoPayload = await req.json();
    console.log('Received payload:', JSON.stringify(payload));
    
    const { jobId, videoPath, logoPath, position, greyscale, outputFormat } = payload;

    try {
      // Update job status to processing
      await updateJobStatus(jobId, 'processing');
      console.log('Updated job status to processing');

      // Get signed URLs for video and logo
      const videoUrl = await getSignedUrl('videos', videoPath);
      const logoUrl = await getSignedUrl('logos', logoPath);

      // Upload video to Cloudinary
      console.log('Uploading video to Cloudinary...');
      const videoUpload = await uploadToCloudinary(videoUrl, {
        resource_type: 'video',
        public_id: `temp_${jobId}_video`,
      });

      // Upload logo to Cloudinary
      console.log('Uploading logo to Cloudinary...');
      const logoUpload = await uploadToCloudinary(logoUrl, {
        public_id: `temp_${jobId}_logo`,
      });

      // Define transformations based on position and greyscale
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
      const result = await processVideo(videoUpload.public_id, transformations, outputFormat);

      // Clean up temporary uploads
      await Promise.all([
        deleteFromCloudinary(`temp_${jobId}_video`),
        deleteFromCloudinary(`temp_${jobId}_logo`),
      ]);

      // Update job as completed
      await updateJobStatus(jobId, 'completed', result.secure_url);
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
      await updateJobStatus(jobId, 'error', undefined, error.message);
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
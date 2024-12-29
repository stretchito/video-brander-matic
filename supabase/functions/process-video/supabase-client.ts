import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function createSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

export async function getSignedUrl(supabaseClient: any, bucket: string, path: string) {
  console.log(`Getting signed URL for ${bucket}/${path}`);
  const { data: url, error } = await supabaseClient.storage
    .from(bucket)
    .createSignedUrl(path, 60);
  
  if (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
  
  if (!url?.signedUrl) {
    throw new Error(`Failed to get signed URL for ${path}`);
  }
  
  console.log('Signed URL created successfully');
  return url.signedUrl;
}

export async function uploadProcessedVideo(
  supabaseClient: any, 
  outputPath: string, 
  fileBuffer: Uint8Array, 
  contentType: string
) {
  console.log(`Uploading processed video to ${outputPath}`);
  const { error: uploadError } = await supabaseClient.storage
    .from('videos')
    .upload(outputPath, fileBuffer, {
      contentType,
      upsert: true
    });

  if (uploadError) {
    console.error('Error uploading processed video:', uploadError);
    throw uploadError;
  }
  
  console.log('Processed video uploaded successfully');
}

export async function updateJobStatus(
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
  
  console.log('Job status updated successfully');
}
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export const getSignedUrl = async (bucket: string, path: string) => {
  console.log(`Getting signed URL for ${bucket}/${path}`);
  const { data: url, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60);
  
  if (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
  
  return url.signedUrl;
};

export const updateJobStatus = async (
  jobId: string, 
  status: string, 
  outputPath?: string, 
  errorMessage?: string
) => {
  console.log(`Updating job ${jobId} status to ${status}`);
  const updates: any = { status };
  if (outputPath) updates.output_path = outputPath;
  if (errorMessage) updates.error_message = errorMessage;

  const { error } = await supabase
    .from('processing_jobs')
    .update(updates)
    .eq('id', jobId);

  if (error) {
    console.error('Error updating job status:', error);
    throw error;
  }
};
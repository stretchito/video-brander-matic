import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export function createSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
}

export async function getSignedUrl(supabaseClient: any, bucket: string, path: string) {
  const { data: url } = await supabaseClient.storage
    .from(bucket)
    .createSignedUrl(path, 60);
  
  if (!url?.signedUrl) throw new Error(`Failed to get signed URL for ${path}`);
  return url.signedUrl;
}

export async function uploadProcessedVideo(supabaseClient: any, outputPath: string, fileBuffer: Uint8Array, contentType: string) {
  const { error: uploadError } = await supabaseClient.storage
    .from('videos')
    .upload(outputPath, fileBuffer, {
      contentType,
      upsert: true
    });

  if (uploadError) throw uploadError;
}

export async function updateJobStatus(supabaseClient: any, jobId: string, status: string, outputPath?: string, errorMessage?: string) {
  const updates: any = { status };
  if (outputPath) updates.output_path = outputPath;
  if (errorMessage) updates.error_message = errorMessage;

  await supabaseClient
    .from('processing_jobs')
    .update(updates)
    .eq('id', jobId);
}
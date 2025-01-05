import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

export const initializeSupabase = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

export const downloadFile = async (supabase: any, bucket: string, path: string) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) {
    console.error(`Error downloading from ${bucket}:`, error);
    throw new Error(`Error downloading file: ${error.message}`);
  }

  return data;
};

export const uploadProcessedVideo = async (
  supabase: any,
  fileData: Uint8Array,
  format: string
) => {
  const outputPath = `processed/${crypto.randomUUID()}.${format}`;

  const { error: uploadError } = await supabase
    .storage
    .from('videos')
    .upload(outputPath, fileData, {
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

  return { outputPath, publicUrl };
};
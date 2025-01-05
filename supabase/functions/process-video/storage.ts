import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

export const initializeSupabase = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

export const downloadFile = async (supabase: any, bucket: string, path: string) => {
  console.log(`Attempting to download file from bucket: ${bucket}, path: ${path}`);
  
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) {
      console.error(`Error downloading from ${bucket}:`, error);
      throw new Error(`Error downloading file: ${error.message}`);
    }

    if (!data) {
      console.error(`No data received from ${bucket}/${path}`);
      throw new Error('No data received from storage');
    }

    console.log(`Successfully downloaded file from ${bucket}/${path}`);
    return data;
  } catch (error) {
    console.error(`Failed to download file from ${bucket}/${path}:`, error);
    throw error;
  }
};

export const uploadProcessedVideo = async (
  supabase: any,
  fileData: Uint8Array,
  format: string
) => {
  const outputPath = `processed/${crypto.randomUUID()}.${format}`;
  console.log(`Attempting to upload processed video to path: ${outputPath}`);

  try {
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

    console.log(`Successfully uploaded processed video to ${outputPath}`);
    return { outputPath, publicUrl };
  } catch (error) {
    console.error('Failed to upload processed video:', error);
    throw error;
  }
};
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function downloadFile(bucketName: string, filePath: string): Promise<Uint8Array> {
  console.log(`Downloading file from bucket: ${bucketName}, path: ${filePath}`);
  
  try {
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .download(filePath);

    if (error) {
      console.error('Error downloading file:', error);
      throw new Error(`Error downloading file: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data received from storage');
    }

    return new Uint8Array(await data.arrayBuffer());
  } catch (error) {
    console.error('Error in downloadFile:', error);
    throw error;
  }
}

export async function uploadFile(bucketName: string, filePath: string, file: Blob): Promise<string> {
  console.log(`Uploading file to bucket: ${bucketName}, path: ${filePath}`);
  
  try {
    const { error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
}
import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from './index';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function downloadFile(bucketName: string, filePath: string): Promise<Uint8Array> {
  console.log(`Attempting to download file from bucket: ${bucketName}, path: ${filePath}`);
  
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
      console.error('No data received from storage');
      throw new Error('No data received from storage');
    }

    console.log(`Successfully downloaded file: ${filePath}`);
    return new Uint8Array(await data.arrayBuffer());
  } catch (error) {
    console.error('Error in downloadFile:', error);
    throw error;
  }
}

export async function uploadFile(bucketName: string, filePath: string, file: Blob): Promise<string> {
  console.log(`Attempting to upload file to bucket: ${bucketName}, path: ${filePath}`);
  
  try {
    const { error: uploadError } = await supabase
      .storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: 'video/mp4',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log(`Successfully uploaded file: ${filePath}`);
    console.log(`Public URL: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
}

export async function getFileInfo(bucketName: string, filePath: string) {
  console.log(`Getting file info for ${filePath} in bucket ${bucketName}`);
  
  try {
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .list('', {
        limit: 1,
        offset: 0,
        search: filePath
      });

    if (error) {
      console.error('Error getting file info:', error);
      throw new Error(`Error getting file info: ${error.message}`);
    }

    console.log('File info:', data);
    return data[0];
  } catch (error) {
    console.error('Error in getFileInfo:', error);
    throw error;
  }
}
import { supabase } from '../lib/supabase';

export const uploadProcessedVideo = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  console.log('Uploading processed video:', fileName);
  
  try {
    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, fileBuffer, {
        contentType,
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading processed video:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName);

    console.log('Video uploaded successfully, public URL:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error in uploadProcessedVideo:', error);
    throw error;
  }
};
import { supabase } from '@/integrations/supabase/client';

export const getCloudinaryConfig = async () => {
  try {
    // Get Cloudinary configuration from Supabase Edge Function
    const { data: config, error } = await supabase.functions.invoke('get-cloudinary-config');
    
    if (error || !config) {
      console.error('Error fetching Cloudinary config:', error);
      throw new Error('Could not fetch Cloudinary configuration');
    }

    if (!config.cloudName) {
      throw new Error('Cloudinary cloud name is missing from configuration');
    }

    return { 
      cloudName: config.cloudName,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret
    };
  } catch (error) {
    console.error('Error in getCloudinaryConfig:', error);
    throw error;
  }
};
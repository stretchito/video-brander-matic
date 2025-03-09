
import { supabase } from '@/integrations/supabase/client';

export const getCloudinaryConfig = async () => {
  try {
    // Get Cloudinary configuration from Supabase Edge Function
    const { data: config, error } = await supabase.functions.invoke('get-cloudinary-config');
    
    if (error || !config) {
      console.error('Error fetching Cloudinary config:', error);
      throw new Error('Could not fetch Cloudinary configuration');
    }

    // Check if we have valid data but with an error field
    if (config.error) {
      console.error('Cloudinary config error:', config.error);
      throw new Error(`Cloudinary config error: ${config.error.details || config.error}`);
    }

    if (!config.cloudName) {
      throw new Error('Cloudinary cloud name is missing from configuration');
    }

    // Log the cloud name so we can see what's happening
    console.log('Using Cloudinary cloud name:', config.cloudName);

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

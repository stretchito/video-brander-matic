import { supabase } from '@/integrations/supabase/client';

export const generateSignature = async (params: Record<string, any> = {}) => {
  try {
    const { data: config, error: configError } = await supabase.functions.invoke('get-cloudinary-config');
    
    if (configError || !config) {
      console.error('Signature generation error:', configError);
      throw new Error('Could not fetch Cloudinary configuration for signature generation');
    }

    // Sort parameters alphabetically and create query string
    const sortedKeys = Object.keys(params).sort();
    const sortedParams = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
    
    // Get signature from Supabase Edge Function
    const { data: signature, error: signError } = await supabase.functions.invoke('generate-cloudinary-signature', {
      body: { params: sortedParams }
    });

    if (signError || !signature) {
      console.error('Error generating signature:', signError);
      throw new Error('Failed to generate Cloudinary signature');
    }

    return signature;
  } catch (error) {
    console.error('Error in generateSignature:', error);
    throw error;
  }
};
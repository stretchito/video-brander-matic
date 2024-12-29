import { supabase } from '@/integrations/supabase/client';

export const generateSignature = async (timestamp: number, params: Record<string, any> = {}) => {
  const { data: config, error: configError } = await supabase.functions.invoke('get-cloudinary-config');
  
  if (configError || !config) {
    console.error('Signature generation error:', configError);
    throw new Error('Could not fetch Cloudinary configuration for signature generation');
  }

  const allParams = { timestamp, ...params };
  const sortedKeys = Object.keys(allParams).sort();
  const sortedParams = sortedKeys.map(key => `${key}=${allParams[key]}`).join('&');
  
  const encoder = new TextEncoder();
  const data = encoder.encode(sortedParams + config.apiSecret);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};
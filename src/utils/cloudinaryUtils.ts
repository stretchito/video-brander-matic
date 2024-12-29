import { PositionType } from '@/types/videoProcessing';
import { supabase } from '@/integrations/supabase/client';

export const getOverlayPosition = (position: PositionType) => {
  switch (position) {
    case 'top-left':
      return { gravity: 'north_west', x: 60, y: 160 };
    case 'top-right':
      return { gravity: 'north_east', x: 60, y: 160 };
    case 'bottom':
      return { gravity: 'north', x: 0, y: 260 };
    case 'center':
      return { gravity: 'center', x: 0, y: 0 };
    default:
      return { gravity: 'north_west', x: 60, y: 160 };
  }
};

export const uploadToCloudinary = async (file: File, resourceType: 'video' | 'image') => {
  // Get Cloudinary configuration from Supabase Edge Function
  const { data: config, error: configError } = await supabase.functions.invoke('get-cloudinary-config');
  
  if (configError || !config) {
    console.error('Cloudinary config error:', configError);
    throw new Error('Could not fetch Cloudinary configuration');
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = await generateSignature(timestamp);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('timestamp', timestamp.toString());
  formData.append('api_key', config.apiKey);
  formData.append('signature', signature);
  
  if (!config.cloudName) {
    throw new Error('Cloudinary credentials are not properly configured');
  }
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Cloudinary upload error:', errorData);
    throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
  }

  return await response.json();
};

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
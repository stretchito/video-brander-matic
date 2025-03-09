
import { PositionType } from '@/types/videoProcessing';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const getOverlayPosition = (position: PositionType) => {
  switch (position) {
    case 'top-left':
      return { gravity: 'north_west', x: 80, y: 108 };
    case 'top-right':
      return { gravity: 'north_east', x: 120, y: 108 };
    case 'bottom':
      return { gravity: 'south', x: 0, y: 320 };
    case 'center':
      return { gravity: 'center', x: 0, y: 0 };
    default:
      return { gravity: 'north_west', x: 80, y: 108 };
  }
};

export const uploadToCloudinary = async (file: File, resourceType: 'video' | 'image') => {
  try {
    // Get Cloudinary configuration from Supabase Edge Function
    const { data: config, error: configError } = await supabase.functions.invoke('get-cloudinary-config');
    
    if (configError || !config) {
      console.error('Cloudinary config error:', configError);
      toast.error('Failed to get Cloudinary configuration');
      throw new Error('Could not fetch Cloudinary configuration');
    }

    if (config.error) {
      console.error('Cloudinary config returned error:', config.error);
      toast.error(`Cloudinary configuration error: ${config.error}`);
      throw new Error(config.error);
    }

    // Validate that all required config values are present
    if (!config.cloudName || !config.apiKey || !config.apiSecret) {
      const missingValues = [];
      if (!config.cloudName) missingValues.push('Cloud Name');
      if (!config.apiKey) missingValues.push('API Key');
      if (!config.apiSecret) missingValues.push('API Secret');
      
      const errorMessage = `Missing Cloudinary credentials: ${missingValues.join(', ')}`;
      console.error(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature(timestamp, config);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', config.apiKey);
    formData.append('signature', signature);

    console.log('Uploading to Cloudinary:', {
      cloudName: config.cloudName,
      resourceType,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    const uploadUrl = `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`;
    console.log('Upload URL:', uploadUrl);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Cloudinary upload error response (${response.status}):`, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`Upload failed: ${errorJson.error?.message || 'Unknown error'}`);
      } catch (e) {
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
      }
    }

    const result = await response.json();
    console.log('Cloudinary upload success:', result);
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const generateSignature = async (timestamp: number, config?: any, params: Record<string, any> = {}) => {
  try {
    // If config is not provided, fetch it
    if (!config) {
      const { data: fetchedConfig, error: configError } = await supabase.functions.invoke('get-cloudinary-config');
      
      if (configError || !fetchedConfig) {
        console.error('Signature generation error:', configError);
        throw new Error('Could not fetch Cloudinary configuration for signature generation');
      }
      
      config = fetchedConfig;
    }

    if (!config.apiSecret) {
      throw new Error('API Secret is required for signature generation');
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
  } catch (error) {
    console.error('Error generating signature:', error);
    throw error;
  }
};

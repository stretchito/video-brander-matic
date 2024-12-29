import { PositionType } from '@/types/videoProcessing';
import { supabase } from '@/integrations/supabase/client';

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
      throw new Error('Could not fetch Cloudinary configuration');
    }

    if (!config.cloudName || !config.apiKey) {
      throw new Error('Cloudinary credentials are not properly configured');
    }

    // Create FormData instance
    const formData = new FormData();
    
    // Log file details before upload
    console.log(`Attempting to upload ${resourceType}:`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      cloudName: config.cloudName
    });

    // Generate upload signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature(timestamp);

    // Append required fields to FormData
    formData.append('file', file);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', config.apiKey);
    formData.append('signature', signature);
    formData.append('resource_type', resourceType);

    // Make the upload request
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${resourceType} upload error:`, {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      throw new Error(`Upload failed: ${errorText}`);
    }

    // Parse and return successful response
    const responseData = await response.json();
    console.log(`${resourceType} upload successful:`, responseData);
    
    return responseData;
  } catch (error) {
    console.error(`Error uploading ${resourceType} to Cloudinary:`, error);
    throw error;
  }
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
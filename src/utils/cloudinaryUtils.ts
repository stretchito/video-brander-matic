
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

export const uploadToCloudinary = async (
  file: File, 
  resourceType: 'video' | 'image',
  onProgress?: (progress: number) => void
) => {
  try {
    // Initialize progress
    onProgress?.(0);

    // Get Cloudinary configuration from Supabase Edge Function
    const { data: config, error: configError } = await supabase.functions.invoke('get-cloudinary-config');
    
    if (configError) {
      console.error('Cloudinary config fetch error:', configError);
      toast.error('Failed to get Cloudinary configuration');
      throw new Error(`Could not fetch Cloudinary configuration: ${configError.message}`);
    }

    if (!config) {
      console.error('No Cloudinary configuration returned');
      toast.error('No Cloudinary configuration found');
      throw new Error('No Cloudinary configuration returned');
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

    onProgress?.(10); // Config fetched successfully

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

    onProgress?.(20); // Ready to upload

    // Use XMLHttpRequest to track upload progress
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', uploadUrl, true);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          // Calculate progress percentage from 20-90%
          const progressPercent = Math.round(20 + (event.loaded / event.total * 70));
          onProgress?.(progressPercent);
        }
      };
      
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.(95); // Upload complete, processing response
          try {
            const result = JSON.parse(xhr.responseText);
            onProgress?.(100); // All done
            resolve(result);
          } catch (error) {
            reject(new Error(`Failed to parse Cloudinary response: ${xhr.responseText}`));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(`Upload failed: ${errorResponse.error?.message || 'Server error'}`));
          } catch (e) {
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
          }
        }
      };
      
      xhr.onerror = function() {
        reject(new Error('Network error during upload'));
      };
      
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    toast.error(`Upload failed: ${(error as Error).message}`);
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

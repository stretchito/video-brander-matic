import { supabase } from '@/integrations/supabase/client';
import { generateSignature } from './signature';

export const uploadToCloudinary = async (file: File, resourceType: 'video' | 'image') => {
  try {
    const { data: config, error: configError } = await supabase.functions.invoke('get-cloudinary-config');
    
    if (configError || !config) {
      console.error('Cloudinary config error:', configError);
      throw new Error('Could not fetch Cloudinary configuration');
    }

    if (!config.cloudName || !config.apiKey) {
      throw new Error('Cloudinary credentials are not properly configured');
    }

    console.log(`Attempting to upload ${resourceType}:`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      cloudName: config.cloudName
    });

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature(timestamp);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', config.apiKey);
    formData.append('signature', signature);
    formData.append('resource_type', resourceType);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`${resourceType} upload error:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Upload failed: ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();
    console.log(`${resourceType} upload successful:`, responseData);
    
    return responseData;
  } catch (error) {
    console.error(`Error uploading ${resourceType} to Cloudinary:`, error);
    throw error;
  }
};
import { supabase } from '@/integrations/supabase/client';
import { generateSignature } from './signature';

export const uploadToCloudinary = async (file: File, resourceType: 'video' | 'image') => {
  try {
    console.log(`Uploading ${resourceType}...`, file.name);
    
    const { data: config, error: configError } = await supabase.functions.invoke('get-cloudinary-config');
    
    if (configError || !config) {
      console.error('Error fetching Cloudinary config:', configError);
      throw new Error('Could not fetch Cloudinary configuration');
    }

    if (!config.cloudName || !config.apiKey) {
      throw new Error('Cloudinary credentials are not properly configured');
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature(timestamp);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', config.apiKey);
    formData.append('signature', signature);
    formData.append('upload_preset', 'ml_default');

    console.log(`Uploading ${resourceType} to Cloudinary...`, {
      cloudName: config.cloudName,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error uploading ${resourceType} to Cloudinary:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Upload failed: ${errorText}`);
    }

    const result = await response.json();
    console.log(`${resourceType} uploaded successfully:`, {
      publicId: result.public_id,
      url: result.secure_url,
      format: result.format
    });
    return result;
  } catch (error) {
    console.error(`Error uploading ${resourceType} to Cloudinary:`, error);
    throw error;
  }
};
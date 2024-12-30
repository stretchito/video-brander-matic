import { supabase } from '@/integrations/supabase/client';
import { generateSignature } from './signature';

export const uploadToCloudinary = async (file: File, resourceType: 'video' | 'image') => {
  try {
    console.log(`Uploading ${resourceType}...`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });
    
    const { data: config, error: configError } = await supabase.functions.invoke('get-cloudinary-config');
    
    if (configError || !config) {
      console.error('Error fetching Cloudinary config:', configError);
      throw new Error('Could not fetch Cloudinary configuration');
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      timestamp,
      upload_preset: 'ml_default'
    };

    const signature = await generateSignature(params);

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

    let responseData;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      console.error(`Error uploading ${resourceType} to Cloudinary:`, {
        status: response.status,
        statusText: response.statusText,
        error: responseData
      });

      let errorMessage = 'Upload failed';
      if (typeof responseData === 'object' && responseData.error?.message) {
        errorMessage = responseData.error.message;
      } else if (typeof responseData === 'string') {
        errorMessage = responseData;
      }

      throw new Error(errorMessage);
    }

    console.log(`${resourceType} uploaded successfully:`, {
      publicId: responseData.public_id,
      url: responseData.secure_url,
      format: responseData.format
    });

    return responseData;
  } catch (error) {
    console.error(`Error uploading ${resourceType} to Cloudinary:`, error);
    throw error;
  }
};
import { Cloudinary } from '@cloudinary/url-gen';
import { supabase } from '@/integrations/supabase/client';

// Initialize with empty values, will be updated when secrets are fetched
let cloudinaryConfig = {
  cloudName: '',
  apiKey: '',
  apiSecret: ''
};

// Function to initialize Cloudinary with secrets from Supabase
export const initCloudinary = async () => {
  const { data: secrets, error } = await supabase.functions.invoke('get-cloudinary-config');
  
  if (error) {
    console.error('Error fetching Cloudinary configuration:', error);
    return;
  }

  if (secrets) {
    cloudinaryConfig = secrets;
  }
};

export const cloudinary = new Cloudinary({
  cloud: {
    cloudName: cloudinaryConfig.cloudName,
    apiKey: cloudinaryConfig.apiKey,
    apiSecret: cloudinaryConfig.apiSecret
  }
});
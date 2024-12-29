import { Transformation } from '@cloudinary/url-gen';
import { grayscale } from '@cloudinary/url-gen/actions/effect';
import { source } from '@cloudinary/url-gen/actions/overlay';
import { Position } from '@cloudinary/url-gen/qualifiers/position';
import { Gravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { PositionType, OverlayPosition } from '@/types/videoProcessing';

export const getOverlayPosition = (position: PositionType): OverlayPosition => {
  switch (position) {
    case 'top-left':
      return { gravity: Gravity.compass('north_west'), x: 10, y: 10 };
    case 'top-right':
      return { gravity: Gravity.compass('north_east'), x: 10, y: 10 };
    case 'bottom':
      return { gravity: Gravity.compass('south'), x: 0, y: 10 };
    case 'center':
      return { gravity: Gravity.compass('center'), x: 0, y: 0 };
    default:
      return { gravity: Gravity.compass('north_west'), x: 10, y: 10 };
  }
};

export const uploadToCloudinary = async (file: File, resourceType: 'video' | 'image') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default');
  
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
  
  if (!cloudName || !apiKey) {
    throw new Error('Cloudinary credentials are not properly configured');
  }
  
  formData.append('api_key', apiKey);
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Upload failed: ${errorData.error?.message || 'Unknown error'}`);
  }

  return await response.json();
};
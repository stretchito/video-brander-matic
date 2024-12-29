import { Transformation } from '@cloudinary/url-gen';
import { grayscale } from '@cloudinary/url-gen/actions/effect';
import { source } from '@cloudinary/url-gen/actions/overlay';
import { Position } from '@cloudinary/url-gen/qualifiers/position';
import { compass, Gravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { PositionType, OverlayPosition } from '@/types/videoProcessing';

export const getOverlayPosition = (position: PositionType): OverlayPosition => {
  switch (position) {
    case 'top-left':
      return { gravity: compass('north_west'), x: 10, y: 10 };
    case 'top-right':
      return { gravity: compass('north_east'), x: 10, y: 10 };
    case 'bottom':
      return { gravity: compass('south'), x: 0, y: 10 };
    case 'center':
      return { gravity: compass('center'), x: 0, y: 0 };
    default:
      return { gravity: compass('north_west'), x: 10, y: 10 };
  }
};

export const uploadToCloudinary = async (file: File, resourceType: 'video' | 'image') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ml_default');
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  return await response.json();
};
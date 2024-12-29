import { getCloudinaryConfig } from '@/utils/cloudinaryConfig';
import { PositionType, VideoFormat } from '@/types/videoProcessing';
import { uploadToCloudinary, getOverlayPosition } from '@/utils/cloudinaryUtils';

export const useCloudinaryProcessing = () => {
  const processVideo = async (
    videoFile: File,
    logoFile: File,
    position: PositionType,
    greyscale: boolean,
    format: VideoFormat
  ) => {
    const { cloudName } = getCloudinaryConfig();
    
    // Upload logo first
    const logoUpload = await uploadToCloudinary(logoFile, 'image');
    
    // Upload and process video
    const videoUpload = await uploadToCloudinary(videoFile, 'video');
    
    // Create transformation string
    const transformations = [];
    if (greyscale) {
      transformations.push('e_grayscale');
    }

    // Add logo overlay with position
    const overlayPosition = getOverlayPosition(position);
    const overlayTransform = `l_${logoUpload.public_id},g_${overlayPosition.gravity},x_${overlayPosition.x},y_${overlayPosition.y}`;
    transformations.push(overlayTransform);

    // Create final video URL
    const transformationString = transformations.join(',');
    const finalVideoUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${transformationString}/${videoUpload.public_id}.${format}`;
    
    // Verify the video URL is accessible
    const response = await fetch(finalVideoUrl, { method: 'HEAD' });
    if (!response.ok) {
      throw new Error('Processed video not yet available');
    }

    return {
      finalVideoUrl,
      videoPublicId: videoUpload.public_id,
      logoPublicId: logoUpload.public_id
    };
  };

  return { processVideo };
};
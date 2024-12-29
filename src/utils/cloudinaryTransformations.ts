interface VideoMetadata {
  width: number;
  height: number;
}

interface LogoPosition {
  x: number;
  y: number;
  gravity: string;
}

// Calculate position based on base dimensions of 1080x1920
const calculatePosition = (
  position: 'top-left' | 'top-right' | 'center' | 'bottom',
  videoMetadata: VideoMetadata
): LogoPosition => {
  // Base coordinates for 1080x1920 video
  const basePositions = {
    'top-left': { x: 100, y: 300 },
    'top-right': { x: 880, y: 300 },
    'center': { x: 440, y: 860 },
    'bottom': { x: 440, y: 1200 }
  };

  const baseWidth = 1080;
  const baseHeight = 1920;

  const scaleX = videoMetadata.width / baseWidth;
  const scaleY = videoMetadata.height / baseHeight;

  const basePos = basePositions[position];
  const scaledX = Math.round(basePos.x * scaleX);
  const scaledY = Math.round(basePos.y * scaleY);

  // Use absolute positioning for all positions
  return {
    x: scaledX,
    y: scaledY,
    gravity: 'north_west'
  };
};

export const buildTransformationString = (
  logoPublicId: string,
  position: 'top-left' | 'top-right' | 'center' | 'bottom',
  greyscale: boolean,
  videoMetadata: VideoMetadata
): string => {
  const transformations = [];

  // Add saturation effect if greyscale is enabled
  if (greyscale) {
    transformations.push('e_saturation:-100');
  }

  // Calculate dynamic position
  const logoPosition = calculatePosition(position, videoMetadata);

  // Add logo overlay with absolute positioning
  transformations.push(
    `l_${logoPublicId.replace(/\//g, ':')}/c_scale,h_200,w_200` +
    `/g_north_west,x_${logoPosition.x},y_${logoPosition.y},fl_layer_apply`
  );

  return transformations.join('/');
};

export const buildCloudinaryUrl = (
  cloudName: string,
  transformationString: string,
  version: string,
  publicId: string,
  format: string
): string => {
  return `https://res.cloudinary.com/${cloudName}/video/upload/${transformationString}/v${version}/${publicId}.${format}`;
};
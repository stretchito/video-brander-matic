export interface ProcessVideoRequest {
  videoPath: string;
  logoPath: string;
  position: string;
  greyscale: boolean;
  format: string;
}

export function validateRequest(data: any): ProcessVideoRequest {
  if (!data.videoPath) {
    throw new Error('Video path is required');
  }
  if (!data.logoPath) {
    throw new Error('Logo path is required');
  }
  if (!data.position) {
    throw new Error('Position is required');
  }
  if (!data.format) {
    throw new Error('Output format is required');
  }

  return {
    videoPath: data.videoPath,
    logoPath: data.logoPath,
    position: data.position,
    greyscale: Boolean(data.greyscale),
    format: data.format
  };
}
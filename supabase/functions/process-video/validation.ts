export interface ProcessVideoRequest {
  videoPath: string;
  logoPath: string;
  position: string;
  greyscale: boolean;
  outputFormat: string;
}

export function validateRequest(body: any): ProcessVideoRequest {
  if (!body) {
    throw new Error('Request body is required');
  }

  const { videoPath, logoPath, position, greyscale, outputFormat } = body;

  if (!videoPath) {
    throw new Error('Video path is required');
  }

  if (!logoPath) {
    throw new Error('Logo path is required');
  }

  if (!position) {
    throw new Error('Position is required');
  }

  if (!outputFormat) {
    throw new Error('Output format is required');
  }

  return {
    videoPath,
    logoPath,
    position,
    greyscale: !!greyscale,
    outputFormat
  };
}
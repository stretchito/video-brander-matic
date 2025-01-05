export interface ProcessVideoRequest {
  videoPath: string;
  logoPath: string;
  position: 'top-left' | 'top-right' | 'bottom' | 'center';
  greyscale: boolean;
  outputFormat: 'mp4' | 'mov' | 'avi' | 'webm';
}

export interface ProcessingJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}
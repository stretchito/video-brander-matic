export interface FileOptions {
  transcription: boolean;
  captions: boolean;
}

export type PositionType = 'top-left' | 'top-right' | 'bottom' | 'center';
export type VideoFormat = 'mp4' | 'mov' | 'avi' | 'webm';
export type ProcessingStatus = 'waiting' | 'processing' | 'completed' | 'error';
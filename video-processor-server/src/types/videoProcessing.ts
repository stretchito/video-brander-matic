import { Gravity } from '@cloudinary/url-gen/qualifiers/gravity';

export type PositionType = 'top-left' | 'top-right' | 'bottom' | 'center';
export type ProcessingStatus = 'waiting' | 'processing' | 'completed' | 'error';
export type VideoFormat = 'mp4' | 'mov' | 'avi' | 'webm';

export interface OverlayPosition {
  gravity: string;
  x: number;
  y: number;
}
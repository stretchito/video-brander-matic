import { Gravity } from '@cloudinary/url-gen/qualifiers/gravity';

export type PositionType = 'top-left' | 'top-right' | 'bottom' | 'center';
export type ProcessingStatus = 'waiting' | 'processing' | 'completed' | 'error';

export interface OverlayPosition {
  gravity: Gravity;
  x: number;
  y: number;
}
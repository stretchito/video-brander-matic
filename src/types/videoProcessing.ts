import { CompassGravity, Gravity } from '@cloudinary/url-gen/qualifiers/gravity';

export type PositionType = 'top-left' | 'top-right' | 'bottom' | 'center';
export type ProcessingStatus = 'waiting' | 'processing' | 'completed' | 'error';

export interface OverlayPosition {
  gravity: CompassGravity;
  x: number;
  y: number;
}
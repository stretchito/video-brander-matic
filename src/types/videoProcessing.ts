export type PositionType = 'top-left' | 'top-right' | 'bottom' | 'center';
export type ProcessingStatus = 'waiting' | 'processing' | 'completed' | 'error';

export interface OverlayPosition {
  gravity: any; // We'll type this properly in the utility function
  x: number;
  y: number;
}
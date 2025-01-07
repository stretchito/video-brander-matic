export const getOverlayPosition = (position: string): string => {
  switch (position) {
    case 'top-left':
      return '10:10';
    case 'top-right':
      return 'main_w-overlay_w-10:10';
    case 'bottom':
      return '(main_w-overlay_w)/2:main_h-overlay_h-10';
    case 'center':
      return '(main_w-overlay_w)/2:(main_h-overlay_h)/2';
    default:
      return '10:10';
  }
};

export const validateVideoFile = (file: File): boolean => {
  const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
  return validTypes.includes(file.type);
};

export const validateLogoFile = (file: File): boolean => {
  const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
  return validTypes.includes(file.type);
};
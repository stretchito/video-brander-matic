import { useState } from 'react';
import { PositionType, VideoFormat } from '@/types/videoProcessing';

export const useVideoState = () => {
  const [videoFiles, setVideoFiles] = useState<{ file: File; path: string }[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPath, setLogoPath] = useState<string>('');
  const [position, setPosition] = useState<PositionType>('top-right');
  const [greyscale, setGreyscale] = useState(false);
  const [format, setFormat] = useState<VideoFormat>('mp4');
  
  const handleVideoSelect = (file: File, path: string) => {
    setVideoFiles(prev => [...prev, { file, path }]);
  };

  const handleLogoSelect = (file: File, path: string) => {
    setLogoFile(file);
    setLogoPath(path);
  };

  return {
    videoFiles,
    setVideoFiles,
    logoFile,
    logoPath,
    position,
    greyscale,
    format,
    setPosition,
    setGreyscale,
    setFormat,
    handleVideoSelect,
    handleLogoSelect
  };
};
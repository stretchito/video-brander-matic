import React from 'react';
import { FileOptions } from '@/types/videoProcessing';

interface FileOptionsManagerProps {
  fileName: string;
  path: string;
  onOptionsChange: (fileName: string, options: { transcription: boolean; captions: boolean }) => void;
  onFileSelect: (file: File, path: string, options?: { transcription?: boolean; captions?: boolean }) => void;
  file: File;
  currentOptions: Record<string, { transcription: boolean; captions: boolean }>;
}

const FileOptionsManager = ({
  fileName,
  path,
  onOptionsChange,
  onFileSelect,
  file,
  currentOptions
}: FileOptionsManagerProps) => {
  React.useEffect(() => {
    const options = currentOptions[fileName];
    if (options) {
      onFileSelect(file, path, {
        transcription: options.transcription,
        captions: options.captions
      });
    }
  }, [currentOptions, fileName, file, path, onFileSelect]);

  return null;
};

export default FileOptionsManager;
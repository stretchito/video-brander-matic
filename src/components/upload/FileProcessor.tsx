import React from 'react';
import { useTranscription } from '@/hooks/useTranscription';

interface FileProcessorProps {
  file: File;
  path: string;
  options?: { transcription?: boolean; captions?: boolean };
  onVideoSelect: (file: File, path: string, options?: { transcription?: boolean; captions?: boolean }) => void;
  setProcessingFiles: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const FileProcessor = ({ file, path, options, onVideoSelect, setProcessingFiles }: FileProcessorProps) => {
  const { startTranscription } = useTranscription();

  React.useEffect(() => {
    const processFile = async () => {
      // Check if file exists first
      if (!file) {
        console.log('Invalid file');
        return;
      }

      // Get current processing files and check if this file is already being processed
      setProcessingFiles(prev => {
        if (prev.has(file.name)) {
          console.log('File already being processed:', file.name);
          return prev;
        }

        const newSet = new Set(prev);
        newSet.add(file.name);
        return newSet;
      });

      try {
        await onVideoSelect(file, path, options);

        if (options?.transcription) {
          await startTranscription(file, path);
        }
      } finally {
        setProcessingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(file.name);
          return newSet;
        });
      }
    };

    processFile();
  }, [file, path, options, onVideoSelect, setProcessingFiles, startTranscription]);

  return null;
};

export default FileProcessor;
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
      if (!file || setProcessingFiles.has(file.name)) {
        console.log('File already being processed or invalid:', file?.name);
        return;
      }

      setProcessingFiles(prev => new Set(prev).add(file.name));

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
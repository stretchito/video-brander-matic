import React, { useState } from 'react';
import { useTranscription } from '@/hooks/useTranscription';
import { useMultiFileUpload } from '@/hooks/useMultiFileUpload';

interface VideoUploaderStateProps {
  onVideoSelect: (file: File, path: string, options?: { transcription?: boolean; captions?: boolean }) => void;
  children: (props: {
    totalSize: number;
    droppedFiles: File[];
    fileOptions: Record<string, { transcription: boolean; captions: boolean }>;
    uploadStates: Record<string, { path: string; progress: number }>;
    handleValidFiles: (validFiles: File[]) => Promise<void>;
    handleTranscriptionChange: (path: string, enabled: boolean) => void;
    handleCaptionsChange: (path: string, enabled: boolean) => void;
    setDroppedFiles: (files: File[]) => void;
  }) => React.ReactNode;
}

const VideoUploaderState = ({ onVideoSelect, children }: VideoUploaderStateProps) => {
  const [totalSize, setTotalSize] = useState(0);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [fileOptions, setFileOptions] = useState<Record<string, { transcription: boolean; captions: boolean }>>({});
  const { startTranscription } = useTranscription();

  const { uploadStates, handleUpload } = useMultiFileUpload({
    bucket: 'videos',
    fileTypes: ['video'],
    onFileSelect: async (file, path) => {
      const options = fileOptions[file.name];
      onVideoSelect(file, path, options);

      if (options?.transcription) {
        await startTranscription(file, path);
      }
    }
  });

  const handleValidFiles = async (validFiles: File[]) => {
    setTotalSize(prev => prev + validFiles.reduce((acc, file) => acc + file.size, 0));
    await handleUpload(validFiles);
  };

  const handleTranscriptionChange = (path: string, enabled: boolean) => {
    const fileName = Object.keys(uploadStates).find(key => uploadStates[key].path === path);
    if (fileName) {
      setFileOptions(prev => ({
        ...prev,
        [fileName]: {
          ...prev[fileName],
          transcription: enabled
        }
      }));
    }
  };

  const handleCaptionsChange = (path: string, enabled: boolean) => {
    const fileName = Object.keys(uploadStates).find(key => uploadStates[key].path === path);
    if (fileName) {
      setFileOptions(prev => ({
        ...prev,
        [fileName]: {
          transcription: enabled ? true : (prev[fileName]?.transcription || false),
          captions: enabled
        }
      }));
    }
  };

  return children({
    totalSize,
    droppedFiles,
    fileOptions,
    uploadStates,
    handleValidFiles,
    handleTranscriptionChange,
    handleCaptionsChange,
    setDroppedFiles
  });
};

export default VideoUploaderState;
import React, { useState } from 'react';
import { useTranscription } from '@/hooks/useTranscription';
import { useMultiFileUpload } from '@/hooks/useMultiFileUpload';
import DuplicateFileHandler from './handlers/DuplicateFileHandler';
import { useFileValidation } from './handlers/FileValidationHandler';

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
    setFileOptions: React.Dispatch<React.SetStateAction<Record<string, { transcription: boolean; captions: boolean }>>>;
  }) => React.ReactNode;
}

const VideoUploaderState = ({ onVideoSelect, children }: VideoUploaderStateProps) => {
  const [totalSize, setTotalSize] = useState(0);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [fileOptions, setFileOptions] = useState<Record<string, { transcription: boolean; captions: boolean }>>({});
  const [duplicateFile, setDuplicateFile] = useState<{ file: File; hash: string; existingPath: string } | null>(null);
  const { startTranscription } = useTranscription();
  const { processingFiles, setProcessingFiles } = useFileValidation({
    setTotalSize,
    setDuplicateFile,
    handleUpload: async () => {} // Placeholder, will be updated
  });

  const { uploadStates, handleUpload } = useMultiFileUpload({
    bucket: 'videos',
    fileTypes: ['video'],
    onFileSelect: async (file, path) => {
      if (processingFiles.has(file.name)) {
        console.log('File already being processed:', file.name);
        return;
      }

      setProcessingFiles(prev => new Set(prev).add(file.name));

      try {
        const options = fileOptions[file.name];
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
    }
  });

  const handleValidFiles = async (validFiles: File[]) => {
    try {
      for (const file of validFiles) {
        if (processingFiles.has(file.name)) {
          console.log('Skipping already processing file:', file.name);
          continue;
        }

        setTotalSize(prev => prev + file.size);
        await handleUpload([file]);
      }
    } catch (error) {
      console.error('Error handling valid files:', error);
    }
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

  return (
    <>
      {children({
        totalSize,
        droppedFiles,
        fileOptions,
        uploadStates,
        handleValidFiles,
        handleTranscriptionChange,
        handleCaptionsChange,
        setDroppedFiles,
        setFileOptions
      })}
      
      <DuplicateFileHandler
        duplicateFile={duplicateFile}
        setDuplicateFile={setDuplicateFile}
        onVideoSelect={onVideoSelect}
        fileOptions={fileOptions}
        handleUpload={handleUpload}
        setTotalSize={setTotalSize}
      />
    </>
  );
};

export default VideoUploaderState;
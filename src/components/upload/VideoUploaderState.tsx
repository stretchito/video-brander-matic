import React, { useState } from 'react';
import { useFileValidation } from './handlers/FileValidationHandler';
import { useMultiFileUpload } from '@/hooks/useMultiFileUpload';
import { useFileOptions } from '@/hooks/useFileOptions';
import DuplicateFileHandler from './handlers/DuplicateFileHandler';
import FileProcessor from './FileProcessor';

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
  const [duplicateFile, setDuplicateFile] = useState<{ file: File; hash: string; existingPath: string } | null>(null);
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set());
  
  const { fileOptions, setFileOptions, handleTranscriptionChange, handleCaptionsChange } = useFileOptions();
  
  const { processingFiles: validationFiles, setProcessingFiles: setValidationFiles } = useFileValidation({
    setTotalSize,
    setDuplicateFile,
    handleUpload: async () => {}
  });

  const { uploadStates, handleUpload } = useMultiFileUpload({
    bucket: 'videos',
    fileTypes: ['video'],
    onFileSelect: (file, path) => {
      const options = fileOptions[file.name];
      return <FileProcessor
        file={file}
        path={path}
        options={options}
        onVideoSelect={onVideoSelect}
        setProcessingFiles={setProcessingFiles}
      />;
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

  return (
    <>
      {children({
        totalSize,
        droppedFiles,
        fileOptions,
        uploadStates,
        handleValidFiles,
        handleTranscriptionChange: (path, enabled) => handleTranscriptionChange(path, enabled, uploadStates),
        handleCaptionsChange: (path, enabled) => handleCaptionsChange(path, enabled, uploadStates),
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
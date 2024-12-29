import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export const useVideoUploader = (
  isProcessing: boolean,
  setDroppedFiles: (files: File[]) => void,
  setFileOptions: React.Dispatch<React.SetStateAction<Record<string, { transcription: boolean; captions: boolean }>>>
) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (files) => {
      try {
        if (isProcessing) {
          console.log('Files are currently being processed, ignoring new drop');
          toast.warning('Please wait for current files to finish processing');
          return;
        }
        
        console.log('Files dropped:', files.map(f => ({ name: f.name, size: f.size })));
        
        setDroppedFiles([]);
        setFileOptions({});
        
        setTimeout(() => {
          setDroppedFiles(files);
        }, 0);
      } catch (error) {
        console.error('Error in onDrop:', error);
        toast.error('Error processing dropped files');
      }
    },
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    multiple: true,
    maxSize: MAX_FILE_SIZE,
    disabled: isProcessing
  });

  return {
    getRootProps,
    getInputProps,
    isDragActive
  };
};
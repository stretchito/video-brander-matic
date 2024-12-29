import React from 'react';
import { toast } from 'sonner';

interface FileSizeValidatorProps {
  files: File[];
  currentTotalSize: number;
  maxFileSize: number;
  maxTotalSize: number;
  onValidationPass: (files: File[]) => void;
}

const FileSizeValidator = ({
  files,
  currentTotalSize,
  maxFileSize,
  maxTotalSize,
  onValidationPass
}: FileSizeValidatorProps) => {
  const MAX_STORAGE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB in bytes

  React.useEffect(() => {
    const validateFiles = () => {
      const newTotalSize = files.reduce((acc, file) => acc + file.size, 0) + currentTotalSize;
      
      console.log('File validation:', {
        files: files.map(f => ({ name: f.name, size: f.size / (1024 * 1024) + 'MB' })),
        currentTotalSize: currentTotalSize / (1024 * 1024) + 'MB',
        newTotalSize: newTotalSize / (1024 * 1024) + 'MB',
        maxFileSize: maxFileSize / (1024 * 1024) + 'MB',
        maxTotalSize: maxTotalSize / (1024 * 1024) + 'MB',
        maxStorageSize: MAX_STORAGE_SIZE / (1024 * 1024 * 1024) + 'GB'
      });

      // Check individual file sizes
      const oversizedFiles = files.filter(file => file.size > maxFileSize);
      if (oversizedFiles.length > 0) {
        const oversizedDetails = oversizedFiles.map(f => 
          `${f.name} (${(f.size / (1024 * 1024)).toFixed(2)}MB)`
        ).join(', ');
        
        toast.error(
          `Some files exceed the ${(maxFileSize / (1024 * 1024)).toFixed(0)}MB limit: ${oversizedDetails}`
        );
        return;
      }

      // Check batch upload size
      const batchSize = files.reduce((acc, file) => acc + file.size, 0);
      if (batchSize > maxTotalSize) {
        toast.error(
          `This batch of files (${(batchSize / (1024 * 1024)).toFixed(2)}MB) exceeds the ${(maxTotalSize / (1024 * 1024)).toFixed(0)}MB batch limit`
        );
        return;
      }

      // Check total storage size
      if (newTotalSize > MAX_STORAGE_SIZE) {
        toast.error(
          `You have ${(currentTotalSize / (1024 * 1024)).toFixed(2)}MB of files stored. Adding ${(files.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(2)}MB would exceed your ${(MAX_STORAGE_SIZE / (1024 * 1024 * 1024)).toFixed(0)}GB storage limit. Please delete some files first.`
        );
        return;
      }

      onValidationPass(files);
    };

    if (files.length > 0) {
      validateFiles();
    }
  }, [files, currentTotalSize, maxFileSize, maxTotalSize, onValidationPass, MAX_STORAGE_SIZE]);

  return null;
};

export default FileSizeValidator;
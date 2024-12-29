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
  React.useEffect(() => {
    const newTotalSize = files.reduce((acc, file) => acc + file.size, 0) + currentTotalSize;
    
    console.log('File validation:', {
      files: files.map(f => ({ name: f.name, size: f.size / (1024 * 1024) + 'MB' })),
      currentTotalSize: currentTotalSize / (1024 * 1024) + 'MB',
      newTotalSize: newTotalSize / (1024 * 1024) + 'MB',
      maxFileSize: maxFileSize / (1024 * 1024) + 'MB',
      maxTotalSize: maxTotalSize / (1024 * 1024) + 'MB'
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

    // Check total size
    if (newTotalSize > maxTotalSize) {
      toast.error(
        `You have ${(currentTotalSize / (1024 * 1024)).toFixed(2)}MB of files stored. Adding ${(files.reduce((acc, file) => acc + file.size, 0) / (1024 * 1024)).toFixed(2)}MB would exceed the ${(maxTotalSize / (1024 * 1024)).toFixed(0)}MB total limit. Please delete some files first.`
      );
      return;
    }

    onValidationPass(files);
  }, [files, currentTotalSize, maxFileSize, maxTotalSize, onValidationPass]);

  return null;
};

export default FileSizeValidator;
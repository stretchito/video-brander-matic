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
    
    // Check individual file sizes
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      toast.error(`Some files exceed the ${maxFileSize / (1024 * 1024)}MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Check total size
    if (newTotalSize > maxTotalSize) {
      toast.error(`Total upload size exceeds ${maxTotalSize / (1024 * 1024)}MB limit`);
      return;
    }

    onValidationPass(files);
  }, [files, currentTotalSize, maxFileSize, maxTotalSize, onValidationPass]);

  return null;
};

export default FileSizeValidator;
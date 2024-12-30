import React from 'react';
import { Upload } from 'lucide-react';
import UploadLimits from './UploadLimits';

interface DropzoneContentProps {
  isDragActive: boolean;
}

const DropzoneContent = ({ isDragActive }: DropzoneContentProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <Upload className="w-12 h-12 mb-4 text-gray-400" />
      <p className="mb-2 text-lg font-medium">
        {isDragActive ? 'Drop your videos here' : 'Drag & drop your videos here'}
      </p>
      <p className="text-sm text-gray-500">or click to select files</p>
      <UploadLimits />
    </div>
  );
};

export default DropzoneContent;
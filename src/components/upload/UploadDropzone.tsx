import React, { forwardRef } from 'react';
import { Upload } from 'lucide-react';
import { DropzoneRootProps } from 'react-dropzone';

interface UploadDropzoneProps extends DropzoneRootProps {
  isDragActive: boolean;
}

const UploadDropzone = forwardRef<HTMLDivElement, UploadDropzoneProps>(
  ({ isDragActive, ...rootProps }, ref) => {
    return (
      <div
        {...rootProps}
        ref={ref}
        className={`p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
          isDragActive ? 'border-accent bg-accent/10' : 'border-gray-300 hover:border-accent'
        }`}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="w-12 h-12 mb-4 text-gray-400" />
          <p className="mb-2 text-lg font-medium">
            {isDragActive ? 'Drop your videos here' : 'Drag & drop your videos here'}
          </p>
          <p className="text-sm text-gray-500">or click to select files</p>
          <p className="mt-2 text-xs text-gray-400">Max file size: 25MB, Total limit: 500MB</p>
          <p className="text-xs text-gray-400">Supported formats: MP4, MOV, AVI, WEBM</p>
          <p className="text-xs text-gray-400 mt-1">Select transcription options below 👇🏾</p>
        </div>
      </div>
    );
  }
);

UploadDropzone.displayName = 'UploadDropzone';

export default UploadDropzone;
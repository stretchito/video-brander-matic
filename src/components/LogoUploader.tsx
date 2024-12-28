import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Image } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useFileUpload } from '@/hooks/useFileUpload';

interface LogoUploaderProps {
  onLogoSelect: (file: File, path: string) => void;
}

const LogoUploader = ({ onLogoSelect }: LogoUploaderProps) => {
  const { uploadProgress, currentFile, handleUpload } = useFileUpload({
    bucket: 'logos',
    fileTypes: ['image'],
    onSuccess: onLogoSelect
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: false
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
          isDragActive ? 'border-accent bg-accent/10' : 'border-gray-300 hover:border-accent'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          <Image className="w-12 h-12 mb-4 text-gray-400" />
          <p className="mb-2 text-lg font-medium">
            {isDragActive ? 'Drop your logo here' : 'Upload your logo'}
          </p>
          <p className="text-sm text-gray-500 mb-2">
            Select or drag & drop your logo file
          </p>
          <div className="text-xs text-gray-400 space-y-1">
            <p>Accepted formats: PNG (recommended), JPG, JPEG, GIF</p>
            <p>Minimum resolution: 300x300 pixels</p>
            <p>PNG with transparency recommended for best results</p>
          </div>
        </div>
      </div>

      {uploadProgress > 0 && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="w-full" />
          <p className="text-sm text-gray-500 text-center">
            {uploadProgress < 100 ? 'Uploading...' : 'Upload complete'}
          </p>
          {currentFile && (
            <p className="text-sm text-center font-medium">
              Current file: {currentFile}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LogoUploader;
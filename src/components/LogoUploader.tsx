import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image } from 'lucide-react';
import { toast } from 'sonner';

interface LogoUploaderProps {
  onLogoSelect: (file: File) => void;
}

const LogoUploader = ({ onLogoSelect }: LogoUploaderProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      onLogoSelect(file);
      toast.success('Logo uploaded successfully');
    } else {
      toast.error('Please upload a valid image file');
    }
  }, [onLogoSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
        isDragActive ? 'border-accent bg-accent/10' : 'border-gray-300 hover:border-accent'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        <Image className="w-8 h-8 mb-2 text-gray-400" />
        <p className="text-sm font-medium">
          {isDragActive ? 'Drop your logo here' : 'Upload your logo'}
        </p>
        <p className="mt-1 text-xs text-gray-400">PNG with transparency recommended</p>
      </div>
    </div>
  );
};

export default LogoUploader;
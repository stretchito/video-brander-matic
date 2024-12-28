import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
}

const VideoUploader = ({ onVideoSelect }: VideoUploaderProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('video/')) {
      onVideoSelect(file);
      toast.success('Video uploaded successfully');
    } else {
      toast.error('Please upload a valid video file');
    }
  }, [onVideoSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
        isDragActive ? 'border-accent bg-accent/10' : 'border-gray-300 hover:border-accent'
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        <Upload className="w-12 h-12 mb-4 text-gray-400" />
        <p className="mb-2 text-lg font-medium">
          {isDragActive ? 'Drop your video here' : 'Drag & drop your video here'}
        </p>
        <p className="text-sm text-gray-500">or click to select a file</p>
        <p className="mt-2 text-xs text-gray-400">Supported formats: MP4, MOV, AVI, WEBM</p>
      </div>
    </div>
  );
};

export default VideoUploader;
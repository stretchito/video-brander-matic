import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import FileList from './FileList';
import { useMultiFileUpload } from '@/hooks/useMultiFileUpload';
import { toast } from 'sonner';

interface VideoUploaderProps {
  onVideoSelect: (file: File, path: string) => void;
}

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB

const VideoUploader = ({ onVideoSelect }: VideoUploaderProps) => {
  const [totalSize, setTotalSize] = useState(0);

  const { uploadStates, handleUpload } = useMultiFileUpload({
    bucket: 'videos',
    fileTypes: ['video'],
    onFileSelect: onVideoSelect
  });

  const onDrop = async (acceptedFiles: File[]) => {
    const newTotalSize = acceptedFiles.reduce((acc, file) => acc + file.size, 0) + totalSize;
    
    // Check individual file sizes
    const oversizedFiles = acceptedFiles.filter(file => file.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      toast.error(`Some files exceed the 25MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Check total size
    if (newTotalSize > MAX_TOTAL_SIZE) {
      toast.error('Total upload size exceeds 500MB limit');
      return;
    }

    setTotalSize(newTotalSize);
    await handleUpload(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    multiple: true,
    maxSize: MAX_FILE_SIZE
  });

  const uploadedFiles = Object.entries(uploadStates).map(([name, state]) => ({
    name,
    path: state.path,
    progress: state.progress
  }));

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
          <Upload className="w-12 h-12 mb-4 text-gray-400" />
          <p className="mb-2 text-lg font-medium">
            {isDragActive ? 'Drop your videos here' : 'Drag & drop your videos here'}
          </p>
          <p className="text-sm text-gray-500">or click to select files</p>
          <p className="mt-2 text-xs text-gray-400">Max file size: 25MB, Total limit: 500MB</p>
          <p className="text-xs text-gray-400">Supported formats: MP4, MOV, AVI, WEBM</p>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <FileList files={uploadedFiles} />
      )}
    </div>
  );
};

export default VideoUploader;
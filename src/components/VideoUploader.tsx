import React from 'react';
import { useDropzone } from 'react-dropzone';
import FileList from './FileList';
import { useMultiFileUpload } from '@/hooks/useMultiFileUpload';
import { useStorageCheck } from './upload/useStorageCheck';
import DropzoneContent from './upload/DropzoneContent';

interface VideoUploaderProps {
  onVideoSelect: (file: File, path: string) => void;
}

const VideoUploader = ({ onVideoSelect }: VideoUploaderProps) => {
  const { checkStorageLimits } = useStorageCheck();
  const { uploadStates, handleUpload } = useMultiFileUpload({
    bucket: 'videos',
    fileTypes: ['video'],
    onFileSelect: onVideoSelect
  });

  const onDrop = async (acceptedFiles: File[]) => {
    const canUpload = await checkStorageLimits(acceptedFiles);
    if (canUpload) {
      await handleUpload(acceptedFiles);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    multiple: true,
    maxSize: 25 * 1024 * 1024 // 25MB
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
        <DropzoneContent isDragActive={isDragActive} />
      </div>

      {uploadedFiles.length > 0 && (
        <FileList files={uploadedFiles} />
      )}
    </div>
  );
};

export default VideoUploader;
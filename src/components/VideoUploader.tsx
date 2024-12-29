import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import FileList from './FileList';
import { useMultiFileUpload } from '@/hooks/useMultiFileUpload';
import { useTranscription } from '@/hooks/useTranscription';
import FileSizeValidator from './upload/FileSizeValidator';
import FileOptionsManager from './upload/FileOptionsManager';
import UploadDropzone from './upload/UploadDropzone';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB

interface VideoUploaderProps {
  onVideoSelect: (file: File, path: string, options?: { transcription?: boolean; captions?: boolean }) => void;
}

const VideoUploader = ({ onVideoSelect }: VideoUploaderProps) => {
  const [totalSize, setTotalSize] = useState(0);
  const [fileOptions, setFileOptions] = useState<Record<string, { transcription: boolean; captions: boolean }>>({});
  const { startTranscription } = useTranscription();

  const { uploadStates, handleUpload } = useMultiFileUpload({
    bucket: 'videos',
    fileTypes: ['video'],
    onFileSelect: async (file, path) => {
      const options = fileOptions[file.name];
      onVideoSelect(file, path, options);

      if (options?.transcription) {
        await startTranscription(file, path);
      }
    }
  });

  const handleValidFiles = async (validFiles: File[]) => {
    setTotalSize(prev => prev + validFiles.reduce((acc, file) => acc + file.size, 0));
    await handleUpload(validFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      // FileSizeValidator component will handle the validation and call handleValidFiles
    },
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.webm']
    },
    multiple: true,
    maxSize: MAX_FILE_SIZE
  });

  const handleTranscriptionChange = (path: string, enabled: boolean) => {
    const fileName = Object.keys(uploadStates).find(key => uploadStates[key].path === path);
    if (fileName) {
      setFileOptions(prev => ({
        ...prev,
        [fileName]: {
          ...prev[fileName],
          transcription: enabled
        }
      }));
    }
  };

  const handleCaptionsChange = (path: string, enabled: boolean) => {
    const fileName = Object.keys(uploadStates).find(key => uploadStates[key].path === path);
    if (fileName) {
      setFileOptions(prev => ({
        ...prev,
        [fileName]: {
          transcription: enabled ? true : (prev[fileName]?.transcription || false),
          captions: enabled
        }
      }));
    }
  };

  const uploadedFiles = Object.entries(uploadStates).map(([name, state]) => ({
    name,
    path: state.path,
    progress: state.progress,
    transcriptionEnabled: fileOptions[name]?.transcription || false,
    captionsEnabled: fileOptions[name]?.captions || false
  }));

  return (
    <div className="space-y-4">
      <FileSizeValidator
        files={[]}
        currentTotalSize={totalSize}
        maxFileSize={MAX_FILE_SIZE}
        maxTotalSize={MAX_TOTAL_SIZE}
        onValidationPass={handleValidFiles}
      />

      <UploadDropzone {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
      </UploadDropzone>

      {uploadedFiles.length > 0 && (
        <FileList 
          files={uploadedFiles}
          onTranscriptionChange={handleTranscriptionChange}
          onCaptionsChange={handleCaptionsChange}
        />
      )}

      {Object.entries(uploadStates).map(([fileName, state]) => (
        <FileOptionsManager
          key={fileName}
          fileName={fileName}
          path={state.path}
          onOptionsChange={(name, options) => {
            setFileOptions(prev => ({
              ...prev,
              [name]: options
            }));
          }}
          onFileSelect={onVideoSelect}
          file={state as unknown as File}
          currentOptions={fileOptions}
        />
      ))}
    </div>
  );
};

export default VideoUploader;
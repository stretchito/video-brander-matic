import React from 'react';
import { useDropzone } from 'react-dropzone';
import FileList from './FileList';
import FileSizeValidator from './upload/FileSizeValidator';
import FileOptionsManager from './upload/FileOptionsManager';
import UploadDropzone from './upload/UploadDropzone';
import VideoUploaderState from './upload/VideoUploaderState';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_TOTAL_SIZE = 500 * 1024 * 1024; // 500MB

interface VideoUploaderProps {
  onVideoSelect: (file: File, path: string, options?: { transcription?: boolean; captions?: boolean }) => void;
}

const VideoUploader = ({ onVideoSelect }: VideoUploaderProps) => {
  return (
    <VideoUploaderState onVideoSelect={onVideoSelect}>
      {({
        totalSize,
        droppedFiles,
        fileOptions,
        uploadStates,
        handleValidFiles,
        handleTranscriptionChange,
        handleCaptionsChange,
        setDroppedFiles,
        setFileOptions
      }) => {
        const { getRootProps, getInputProps, isDragActive } = useDropzone({
          onDrop: async (files) => {
            // Clear previous files to prevent re-upload
            setDroppedFiles([]);
            console.log('Dropped files:', files.map(f => ({ name: f.name, size: f.size / (1024 * 1024) + 'MB' })));
            // Set new files after a short delay to prevent state update loop
            setTimeout(() => {
              setDroppedFiles(files);
            }, 100);
          },
          accept: {
            'video/*': ['.mp4', '.mov', '.avi', '.webm']
          },
          multiple: true,
          maxSize: MAX_FILE_SIZE
        });

        const uploadedFiles = Object.entries(uploadStates).map(([name, state]) => ({
          name,
          path: state.path,
          progress: state.progress,
          transcriptionEnabled: fileOptions[name]?.transcription || false,
          captionsEnabled: fileOptions[name]?.captions || false
        }));

        return (
          <div className="space-y-4">
            {droppedFiles.length > 0 && (
              <FileSizeValidator
                files={droppedFiles}
                currentTotalSize={totalSize}
                maxFileSize={MAX_FILE_SIZE}
                maxTotalSize={MAX_TOTAL_SIZE}
                onValidationPass={handleValidFiles}
              />
            )}

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
      }}
    </VideoUploaderState>
  );
};

export default VideoUploader;
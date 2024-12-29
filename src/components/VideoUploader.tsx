import React from 'react';
import FileList from './FileList';
import FileSizeValidator from './upload/FileSizeValidator';
import FileOptionsManager from './upload/FileOptionsManager';
import UploadDropzone from './upload/UploadDropzone';
import VideoUploaderState from './upload/VideoUploaderState';
import { useVideoUploader } from './upload/video/useVideoUploader';

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
        const isProcessing = Object.keys(uploadStates).length > 0;
        
        const { getRootProps, getInputProps, isDragActive } = useVideoUploader(
          isProcessing,
          setDroppedFiles,
          setFileOptions
        );

        return (
          <div className="space-y-4">
            {droppedFiles.length > 0 && !isProcessing && (
              <FileSizeValidator
                files={droppedFiles}
                currentTotalSize={totalSize}
                maxFileSize={25 * 1024 * 1024}
                maxTotalSize={500 * 1024 * 1024}
                onValidationPass={handleValidFiles}
              />
            )}

            <UploadDropzone {...getRootProps()} isDragActive={isDragActive}>
              <input {...getInputProps()} />
            </UploadDropzone>

            {Object.entries(uploadStates).length > 0 && (
              <FileList 
                files={Object.entries(uploadStates).map(([name, state]) => ({
                  name,
                  path: state.path,
                  progress: state.progress,
                  transcriptionEnabled: fileOptions[name]?.transcription || false,
                  captionsEnabled: fileOptions[name]?.captions || false
                }))}
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
import React from 'react';
import SingleFileView from './upload/SingleFileView';
import MultipleFilesView from './upload/MultipleFilesView';

interface FileListProps {
  files: { 
    name: string; 
    path: string; 
    progress: number;
    transcriptionEnabled?: boolean;
    captionsEnabled?: boolean;
  }[];
  onTranscriptionChange?: (path: string, enabled: boolean) => void;
  onCaptionsChange?: (path: string, enabled: boolean) => void;
}

const FileList = ({ files, onTranscriptionChange, onCaptionsChange }: FileListProps) => {
  const handleTranscriptionChange = (checked: boolean, path: string) => {
    onTranscriptionChange?.(path, checked);
  };

  const handleCaptionsChange = (checked: boolean, path: string) => {
    if (checked) {
      // If captions are enabled, automatically enable transcription
      onTranscriptionChange?.(path, true);
    }
    onCaptionsChange?.(path, checked);
  };

  if (files.length === 1) {
    return (
      <div className="w-full">
        <SingleFileView
          file={files[0]}
          onTranscriptionChange={handleTranscriptionChange}
          onCaptionsChange={handleCaptionsChange}
        />
      </div>
    );
  }

  return (
    <MultipleFilesView
      files={files}
      onTranscriptionChange={handleTranscriptionChange}
      onCaptionsChange={handleCaptionsChange}
    />
  );
};

export default FileList;
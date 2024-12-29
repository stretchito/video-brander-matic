import React from 'react';
import FileProgressBar from './FileProgressBar';
import FileOptions from './FileOptions';

interface SingleFileViewProps {
  file: {
    name: string;
    path: string;
    progress: number;
    transcriptionEnabled?: boolean;
    captionsEnabled?: boolean;
  };
  onTranscriptionChange: (checked: boolean, path: string) => void;
  onCaptionsChange: (checked: boolean, path: string) => void;
}

const SingleFileView = ({ file, onTranscriptionChange, onCaptionsChange }: SingleFileViewProps) => {
  return (
    <div className="p-4 bg-secondary/5 rounded-lg">
      <FileProgressBar fileName={file.name} progress={file.progress} />
      {file.progress === 100 && (
        <FileOptions
          filePath={file.path}
          transcriptionEnabled={file.transcriptionEnabled}
          captionsEnabled={file.captionsEnabled}
          onTranscriptionChange={(checked) => onTranscriptionChange(checked, file.path)}
          onCaptionsChange={(checked) => onCaptionsChange(checked, file.path)}
        />
      )}
    </div>
  );
};

export default SingleFileView;
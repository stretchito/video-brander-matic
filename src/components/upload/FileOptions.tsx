import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface FileOptionsProps {
  filePath: string;
  transcriptionEnabled?: boolean;
  captionsEnabled?: boolean;
  onTranscriptionChange: (checked: boolean) => void;
  onCaptionsChange: (checked: boolean) => void;
}

const FileOptions = ({
  filePath,
  transcriptionEnabled,
  captionsEnabled,
  onTranscriptionChange,
  onCaptionsChange,
}: FileOptionsProps) => {
  return (
    <div className="flex items-center gap-4 mt-2">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id={`transcription-${filePath}`}
          checked={transcriptionEnabled}
          onCheckedChange={(checked) => onTranscriptionChange(checked as boolean)}
        />
        <label 
          htmlFor={`transcription-${filePath}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Transcribe
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id={`captions-${filePath}`}
          checked={captionsEnabled}
          onCheckedChange={(checked) => onCaptionsChange(checked as boolean)}
        />
        <label 
          htmlFor={`captions-${filePath}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Summary (Social)
        </label>
      </div>
    </div>
  );
};

export default FileOptions;
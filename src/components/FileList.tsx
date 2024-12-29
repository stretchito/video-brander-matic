import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

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
  const [isOpen, setIsOpen] = useState(files.length > 1);
  const lastFile = files[files.length - 1];
  const isSingleFile = files.length === 1;

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

  const renderFileOptions = (file: typeof files[0]) => (
    <div className="flex items-center gap-4 mt-2">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id={`transcription-${file.path}`}
          checked={file.transcriptionEnabled}
          onCheckedChange={(checked) => handleTranscriptionChange(checked as boolean, file.path)}
        />
        <label 
          htmlFor={`transcription-${file.path}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Transcribe
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id={`captions-${file.path}`}
          checked={file.captionsEnabled}
          onCheckedChange={(checked) => handleCaptionsChange(checked as boolean, file.path)}
        />
        <label 
          htmlFor={`captions-${file.path}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Summary (for social media)
        </label>
      </div>
    </div>
  );

  // For single file, render without collapsible
  if (isSingleFile) {
    const file = files[0];
    return (
      <div className="w-full">
        <div className="p-4 bg-secondary/5 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">{file.name}</span>
            {file.progress === 100 ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : file.progress === 0 ? (
              <XCircle className="h-4 w-4 text-red-500" />
            ) : null}
          </div>
          <Progress 
            value={file.progress} 
            className={cn(
              "h-1",
              file.progress === 0 && "opacity-50",
              file.progress === 100 && "bg-green-100",
              file.progress === 0 && "bg-red-100"
            )}
            indicatorClassName={cn(
              file.progress === 0 && "bg-transparent",
              file.progress === 100 && "bg-green-500",
              file.progress > 0 && file.progress < 100 && "bg-primary"
            )}
          />
          {file.progress === 100 && renderFileOptions(file)}
        </div>
      </div>
    );
  }

  // For multiple files, use collapsible
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-secondary/10 rounded-md hover:bg-secondary/20">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {lastFile?.name || 'No files uploaded'}
          </span>
          <span className="text-xs text-muted-foreground">
            +{files.length - 1} more
          </span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ScrollArea className="h-[300px] w-full rounded-md border mt-2">
          <div className="p-4 space-y-2">
            {files.map((file) => (
              <div
                key={file.path}
                className="py-2 px-3 bg-secondary/5 rounded-lg"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{file.name}</span>
                  {file.progress === 100 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : file.progress === 0 ? (
                    <XCircle className="h-4 w-4 text-red-500" />
                  ) : null}
                </div>
                <Progress 
                  value={file.progress} 
                  className={cn(
                    "h-1",
                    file.progress === 0 && "opacity-50",
                    file.progress === 100 && "bg-green-100",
                    file.progress === 0 && "bg-red-100"
                  )}
                  indicatorClassName={cn(
                    file.progress === 0 && "bg-transparent",
                    file.progress === 100 && "bg-green-500",
                    file.progress > 0 && file.progress < 100 && "bg-primary"
                  )}
                />
                {file.progress === 100 && renderFileOptions(file)}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default FileList;
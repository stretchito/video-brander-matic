import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import FileProgressBar from './FileProgressBar';
import FileOptions from './FileOptions';

interface MultipleFilesViewProps {
  files: {
    name: string;
    path: string;
    progress: number;
    transcriptionEnabled?: boolean;
    captionsEnabled?: boolean;
  }[];
  onTranscriptionChange: (checked: boolean, path: string) => void;
  onCaptionsChange: (checked: boolean, path: string) => void;
}

const MultipleFilesView = ({ files, onTranscriptionChange, onCaptionsChange }: MultipleFilesViewProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const lastFile = files[files.length - 1];

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
            ))}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default MultipleFilesView;
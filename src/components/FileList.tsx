import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileListProps {
  files: { name: string; path: string; progress: number }[];
}

const FileList = ({ files }: FileListProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const lastFile = files[files.length - 1];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-secondary/10 rounded-md hover:bg-secondary/20">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {lastFile?.name || 'No files uploaded'}
          </span>
          {files.length > 1 && (
            <span className="text-xs text-muted-foreground">
              +{files.length - 1} more
            </span>
          )}
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
                    file.progress === 100 && "bg-green-100",
                    file.progress === 0 && "bg-red-100"
                  )}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default FileList;
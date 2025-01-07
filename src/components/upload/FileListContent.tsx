import React from 'react';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileListContentProps {
  isOpen: boolean;
  files: { name: string; path: string; progress: number }[];
}

const FileListContent = ({ isOpen, files }: FileListContentProps) => {
  if (!isOpen) return null;

  return (
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
            </div>
          ))}
        </div>
      </ScrollArea>
    </CollapsibleContent>
  );
};

export default FileListContent;
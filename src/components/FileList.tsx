import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FileListProps {
  files: { name: string; path: string }[];
}

const FileList = ({ files }: FileListProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const lastFile = files[files.length - 1];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-2 bg-secondary/10 rounded-md hover:bg-secondary/20">
        <span className="text-sm font-medium">
          {lastFile?.name || 'No files uploaded'}
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ScrollArea className="h-[300px] w-full rounded-md border mt-2">
          <div className="p-4">
            {files.map((file, index) => (
              <div
                key={file.path}
                className="py-2 text-sm border-b last:border-0"
              >
                {file.name}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default FileList;
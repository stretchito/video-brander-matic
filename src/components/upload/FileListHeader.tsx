import React from 'react';
import { CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FileListHeaderProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  lastFile: { name: string } | undefined;
  totalFiles: number;
}

const FileListHeader = ({ isOpen, setIsOpen, lastFile, totalFiles }: FileListHeaderProps) => (
  <CollapsibleTrigger 
    className="flex items-center justify-between w-full p-2 bg-secondary/10 rounded-md hover:bg-secondary/20"
    onClick={() => setIsOpen(!isOpen)}
  >
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">
        {lastFile?.name || 'No files uploaded'}
      </span>
      {totalFiles > 1 && (
        <span className="text-xs text-muted-foreground">
          +{totalFiles - 1} more
        </span>
      )}
    </div>
    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
  </CollapsibleTrigger>
);

export default FileListHeader;
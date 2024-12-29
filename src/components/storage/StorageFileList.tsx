import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import FileListItem from './FileListItem';

interface StorageFile {
  name: string;
  size: number;
  path: string;
}

interface StorageFileListProps {
  files: StorageFile[];
  onDeleteFile: (path: string) => Promise<void>;
}

const StorageFileList = ({ files, onDeleteFile }: StorageFileListProps) => {
  const validFiles = Array.isArray(files) ? files : [];
  
  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      {validFiles.length === 0 ? (
        <p className="text-muted-foreground">No files stored</p>
      ) : (
        <div className="space-y-2">
          {validFiles.map((file) => (
            <FileListItem
              key={file.path}
              name={file.name}
              size={file.size}
              onDelete={() => onDeleteFile(file.path)}
            />
          ))}
        </div>
      )}
    </ScrollArea>
  );
};

export default StorageFileList;
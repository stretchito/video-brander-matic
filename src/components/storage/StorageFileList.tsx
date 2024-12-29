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
  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      {files.length === 0 ? (
        <p className="text-muted-foreground">No files stored</p>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
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
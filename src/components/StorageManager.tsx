import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import FileListItem from './storage/FileListItem';
import DeleteAllDialog from './storage/DeleteAllDialog';
import { useStorageFiles } from '@/hooks/useStorageFiles';

const StorageManager = () => {
  const { files, loading, deleteFile, deleteAllFiles } = useStorageFiles();

  if (loading) {
    return <div>Loading storage information...</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-background">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Storage Manager</h3>
        {files.length > 0 && <DeleteAllDialog onDeleteAll={deleteAllFiles} />}
      </div>
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
                onDelete={() => deleteFile(file.path)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default StorageManager;
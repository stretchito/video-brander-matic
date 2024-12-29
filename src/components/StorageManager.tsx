import React from 'react';
import StorageHeader from './storage/StorageHeader';
import StorageFileList from './storage/StorageFileList';
import { useStorageFiles } from '@/hooks/useStorageFiles';

const StorageManager = () => {
  const { files, loading, deleteFile, deleteAllFiles } = useStorageFiles();

  if (loading) {
    return <div>Loading storage information...</div>;
  }

  return (
    <div className="p-4 border rounded-lg bg-background">
      <StorageHeader 
        filesCount={files.length} 
        onDeleteAll={deleteAllFiles} 
      />
      <StorageFileList 
        files={files} 
        onDeleteFile={deleteFile} 
      />
    </div>
  );
};

export default StorageManager;
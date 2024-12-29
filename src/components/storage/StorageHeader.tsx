import React from 'react';
import DeleteAllDialog from './DeleteAllDialog';

interface StorageHeaderProps {
  filesCount: number;
  onDeleteAll: () => Promise<void>;
}

const StorageHeader = ({ filesCount, onDeleteAll }: StorageHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">
        Storage Manager {filesCount > 0 && `(${filesCount} files)`}
      </h3>
      {filesCount > 0 && <DeleteAllDialog onDeleteAll={onDeleteAll} />}
    </div>
  );
};

export default StorageHeader;
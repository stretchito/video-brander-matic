import React from 'react';
import { useFileListState } from '@/hooks/useFileListState';
import FileListHeader from './upload/FileListHeader';
import FileListContent from './upload/FileListContent';

interface FileListProps {
  files: { name: string; path: string; progress: number }[];
}

const FileList = ({ files }: FileListProps) => {
  const { isOpen, setIsOpen } = useFileListState();
  const lastFile = files[files.length - 1];

  return (
    <div className="w-full">
      <FileListHeader
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        lastFile={lastFile}
        totalFiles={files.length}
      />
      <FileListContent
        isOpen={isOpen}
        files={files}
      />
    </div>
  );
};

export default FileList;
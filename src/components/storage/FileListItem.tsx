import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface FileListItemProps {
  name: string;
  size: number;
  onDelete: () => void;
}

const FileListItem = ({ name, size, onDelete }: FileListItemProps) => {
  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="flex items-center justify-between p-2 hover:bg-accent rounded-lg">
      <div>
        <p className="font-medium">{name}</p>
        <p className="text-sm text-muted-foreground">{formatSize(size)}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="text-destructive hover:text-destructive/90"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default FileListItem;
import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DownloadSectionProps {
  selectedCount: number;
  compressionStatus: 'idle' | 'compressing' | 'completed';
  compressionProgress: number;
  onDownload: () => Promise<void>;
}

const DownloadSection = ({ 
  selectedCount, 
  compressionStatus, 
  compressionProgress, 
  onDownload 
}: DownloadSectionProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="space-y-2">
      {compressionStatus !== 'idle' && (
        <Progress 
          value={compressionProgress}
          className={cn(
            "w-full",
            compressionStatus === 'compressing' ? 'bg-secondary' : '',
            compressionStatus === 'completed' ? 'bg-green-100' : ''
          )}
          indicatorClassName={cn(
            compressionStatus === 'compressing' ? 'bg-primary' : '',
            compressionStatus === 'completed' ? 'bg-green-500' : ''
          )}
        />
      )}
      <Button
        onClick={onDownload}
        className="w-full flex items-center gap-2"
        disabled={compressionStatus === 'compressing'}
      >
        <Download className="w-4 h-4" />
        {compressionStatus === 'compressing' 
          ? 'Compressing...' 
          : `Download Selected (${selectedCount})`}
      </Button>
    </div>
  );
};

export default DownloadSection;
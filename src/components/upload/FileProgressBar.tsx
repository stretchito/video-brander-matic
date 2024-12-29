import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileProgressBarProps {
  fileName: string;
  progress: number;
}

const FileProgressBar = ({ fileName, progress }: FileProgressBarProps) => {
  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{fileName}</span>
        {progress === 100 ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : progress === 0 ? (
          <XCircle className="h-4 w-4 text-red-500" />
        ) : null}
      </div>
      <Progress 
        value={progress} 
        className={cn(
          "h-1",
          progress === 0 && "opacity-50",
          progress === 100 && "bg-green-100",
          progress === 0 && "bg-red-100"
        )}
        indicatorClassName={cn(
          progress === 0 && "bg-transparent",
          progress === 100 && "bg-green-500",
          progress > 0 && progress < 100 && "bg-primary"
        )}
      />
    </>
  );
};

export default FileProgressBar;
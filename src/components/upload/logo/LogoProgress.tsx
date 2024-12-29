import React from 'react';
import { Progress } from '@/components/ui/progress';

interface LogoProgressProps {
  uploadProgress: number;
  currentFile: string | null;
}

const LogoProgress = ({ uploadProgress, currentFile }: LogoProgressProps) => {
  const getProgressColor = () => {
    if (uploadProgress === 0) return 'bg-gray-200';
    if (uploadProgress === 100) return 'bg-green-500';
    return 'bg-blue-400';
  };

  return (
    <div className="space-y-2">
      <Progress 
        value={uploadProgress} 
        className="w-full" 
        indicatorClassName={`transition-colors duration-300 ${getProgressColor()}`}
      />
      <p className="text-sm text-gray-500 text-center">
        {uploadProgress < 100 ? 'Uploading...' : 'Upload complete'}
      </p>
      {currentFile && (
        <p className="text-sm text-center font-medium">
          Current file: {currentFile}
        </p>
      )}
    </div>
  );
};

export default LogoProgress;
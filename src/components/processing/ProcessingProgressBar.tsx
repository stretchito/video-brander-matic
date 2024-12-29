import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProcessingProgressBarProps {
  status: 'waiting' | 'processing' | 'completed' | 'error';
  progress: number;
}

const ProcessingProgressBar = ({ status, progress }: ProcessingProgressBarProps) => {
  const getProgressColor = () => {
    if (status === 'waiting') return 'bg-gray-200';
    if (progress === 100 && status === 'completed') return 'bg-green-500';
    if (status === 'error') return 'bg-red-500';
    return 'bg-[#33C3F0]';
  };

  return (
    <Progress 
      value={status === 'waiting' ? 0 : progress} 
      className={cn(
        "w-full",
        status === 'waiting' ? 'opacity-50' : 'opacity-100'
      )}
      indicatorClassName={cn(getProgressColor())}
    />
  );
};

export default ProcessingProgressBar;
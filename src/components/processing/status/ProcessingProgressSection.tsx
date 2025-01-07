import React from 'react';
import ProcessingProgressBar from '../ProcessingProgressBar';
import { ProcessingStatus } from '@/types/videoProcessing';

interface ProcessingProgressSectionProps {
  status: ProcessingStatus;
  progress: number;
  totalSteps: number;
  completedSteps: number;
}

const ProcessingProgressSection = ({
  status,
  progress,
  totalSteps,
  completedSteps
}: ProcessingProgressSectionProps) => {
  const calculatedProgress = totalSteps > 0 
    ? Math.round((completedSteps / totalSteps) * 100)
    : progress;

  return (
    <ProcessingProgressBar 
      status={status} 
      progress={calculatedProgress} 
    />
  );
};

export default ProcessingProgressSection;
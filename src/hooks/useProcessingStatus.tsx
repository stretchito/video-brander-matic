import { useState } from 'react';
import { ProcessingStatus } from '@/types/videoProcessing';

export const useProcessingStatus = () => {
  const [status, setStatus] = useState<ProcessingStatus>('waiting');
  const [currentAction, setCurrentAction] = useState('Waiting to start...');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string>('');
  const [totalSteps, setTotalSteps] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);

  const updateStatus = (
    newStatus: ProcessingStatus,
    newAction: string,
    newProgress: number,
    steps?: { total?: number; completed?: number; current?: string }
  ) => {
    setStatus(newStatus);
    setCurrentAction(newAction);
    setProgress(newProgress);

    if (steps?.total !== undefined) {
      setTotalSteps(steps.total);
    }
    if (steps?.completed !== undefined) {
      setCompletedSteps(steps.completed);
    }
    if (steps?.current) {
      setProcessingSteps(prev => [...prev, steps.current]);
    }
  };

  const resetStatus = () => {
    setStatus('waiting');
    setCurrentAction('Waiting to start...');
    setProgress(0);
    setIsProcessing(false);
    setProcessedVideoUrl('');
    setTotalSteps(0);
    setCompletedSteps(0);
    setProcessingSteps([]);
  };

  return {
    status,
    setStatus,
    currentAction,
    setCurrentAction,
    progress,
    setProgress,
    isProcessing,
    setIsProcessing,
    processedVideoUrl,
    setProcessedVideoUrl,
    totalSteps,
    completedSteps,
    processingSteps,
    updateStatus,
    resetStatus
  };
};
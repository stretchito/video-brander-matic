import { useState } from 'react';
import { ProcessingStatus } from '@/types/videoProcessing';

export const useVideoProcessingState = () => {
  const [processedCount, setProcessedCount] = useState(0);
  const [processedUrls, setProcessedUrls] = useState<string[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>('waiting');
  const [currentAction, setCurrentAction] = useState('Waiting to start...');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const updateStatus = (
    newStatus: ProcessingStatus,
    newAction: string,
    newProgress: number
  ) => {
    setStatus(newStatus);
    setCurrentAction(newAction);
    setProgress(newProgress);
  };

  return {
    processedCount,
    setProcessedCount,
    processedUrls,
    setProcessedUrls,
    status,
    currentAction,
    progress,
    isProcessing,
    setIsProcessing,
    updateStatus
  };
};
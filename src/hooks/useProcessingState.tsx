import { useState } from 'react';
import { ProcessingStatus } from '@/types/videoProcessing';

export const useProcessingState = () => {
  const [status, setStatus] = useState<ProcessingStatus>('waiting');
  const [currentAction, setCurrentAction] = useState('Waiting to start...');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string>('');
  const [processedCount, setProcessedCount] = useState(0);
  const [processedUrls, setProcessedUrls] = useState<string[]>([]);

  const updateStatus = (
    newStatus: ProcessingStatus,
    newAction: string,
    newProgress: number
  ) => {
    setStatus(newStatus);
    setCurrentAction(newAction);
    setProgress(newProgress);
  };

  const resetStatus = () => {
    setStatus('waiting');
    setCurrentAction('Waiting to start...');
    setProgress(0);
    setIsProcessing(false);
    setProcessedVideoUrl('');
  };

  return {
    status,
    currentAction,
    progress,
    isProcessing,
    processedVideoUrl,
    processedCount,
    processedUrls,
    setStatus,
    setCurrentAction,
    setProgress,
    setIsProcessing,
    setProcessedVideoUrl,
    setProcessedCount,
    setProcessedUrls,
    updateStatus,
    resetStatus
  };
};
import { useState } from 'react';
import { ProcessingStatus } from '@/types/videoProcessing';

export const useProcessingStatus = () => {
  const [status, setStatus] = useState<ProcessingStatus>('waiting');
  const [currentAction, setCurrentAction] = useState('Waiting to start...');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string>('');

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
    setProcessedVideoUrl
  };
};
import { useState } from 'react';

export const useProcessingSteps = () => {
  const [totalSteps, setTotalSteps] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);

  const updateSteps = (
    newTotalSteps: number,
    newCompletedSteps: number,
    currentStep?: string
  ) => {
    setTotalSteps(newTotalSteps);
    setCompletedSteps(newCompletedSteps);
    if (currentStep) {
      setProcessingSteps(prev => [...prev, currentStep]);
    }
  };

  const resetSteps = () => {
    setTotalSteps(0);
    setCompletedSteps(0);
    setProcessingSteps([]);
  };

  return {
    totalSteps,
    completedSteps,
    processingSteps,
    updateSteps,
    resetSteps
  };
};
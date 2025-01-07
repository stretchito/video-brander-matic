import React from 'react';
import StatusCard from '../StatusCard';
import { ProcessingStatus } from '@/types/videoProcessing';

interface ProcessingStatusCardsProps {
  status: ProcessingStatus;
  currentAction: string;
  hasProcessedVideos: boolean;
  processedCount: number;
  totalVideos: number;
  onViewVideos: () => void;
  showSuccessMessage: boolean;
  processingSteps: string[];
}

const ProcessingStatusCards = ({
  status,
  currentAction,
  hasProcessedVideos,
  processedCount,
  totalVideos,
  onViewVideos,
  showSuccessMessage,
  processingSteps
}: ProcessingStatusCardsProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-center gap-4">
      <StatusCard
        title="Status"
        status={status}
        currentAction={currentAction}
        hasProcessedVideos={hasProcessedVideos}
        processedCount={processedCount}
        totalVideos={totalVideos}
        onViewVideos={onViewVideos}
        showSuccessMessage={false}
        processingSteps={processingSteps}
      />

      <StatusCard
        title="Current Action"
        status={status}
        currentAction={currentAction}
        hasProcessedVideos={hasProcessedVideos}
        processedCount={processedCount}
        totalVideos={totalVideos}
        onViewVideos={onViewVideos}
        showSuccessMessage={showSuccessMessage}
        processingSteps={processingSteps}
      />
    </div>
  );
};

export default ProcessingStatusCards;
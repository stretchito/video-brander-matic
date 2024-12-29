import React, { useState, useEffect } from 'react';
import ProcessingProgressBar from './ProcessingProgressBar';
import StatusCard from './StatusCard';
import ProcessedVideosModal from './ProcessedVideosModal';

interface ProcessingStatusProps {
  status: 'waiting' | 'processing' | 'completed' | 'error';
  currentAction: string;
  progress: number;
  totalVideos?: number;
  processedCount?: number;
  steps?: string[];
  completedSteps?: number;
  totalSteps?: number;
}

const ProcessingStatus = ({ 
  status, 
  currentAction, 
  progress,
  totalVideos = 0,
  processedCount = 0,
  steps = [],
  completedSteps = 0,
  totalSteps = 0
}: ProcessingStatusProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  
  useEffect(() => {
    if (currentAction.startsWith('https://res.cloudinary.com') && 
        (currentAction.endsWith('.mp4') || 
         currentAction.endsWith('.mov') || 
         currentAction.endsWith('.avi') || 
         currentAction.endsWith('.webm'))) {
      setVideoUrls(prev => [...new Set([...prev, currentAction])]);
      setIsModalOpen(true);
    }
  }, [currentAction]);

  useEffect(() => {
    if (status === 'waiting') {
      setVideoUrls([]);
      setIsModalOpen(false);
    }
  }, [status]);

  const displayCount = Math.min(processedCount, totalVideos);
  const displayTotal = totalVideos || videoUrls.length;
  const hasProcessedVideos = videoUrls.length > 0;
  const allVideosProcessed = displayCount === displayTotal && displayTotal > 0;
  const showSuccessMessage = status === 'completed' && allVideosProcessed;

  const getStepProgress = () => {
    if (totalSteps === 0) return progress;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  return (
    <div className="flex flex-col gap-4">
      <ProcessingProgressBar status={status} progress={getStepProgress()} />
      
      <div className="flex flex-col md:flex-row justify-center gap-4">
        <StatusCard
          title="Status"
          status={status}
          currentAction={currentAction}
          hasProcessedVideos={hasProcessedVideos}
          processedCount={displayCount}
          totalVideos={displayTotal}
          onViewVideos={() => setIsModalOpen(true)}
          showSuccessMessage={false}
          steps={steps}
          completedSteps={completedSteps}
          totalSteps={totalSteps}
        />

        <StatusCard
          title="Current Action"
          status={status}
          currentAction={currentAction}
          hasProcessedVideos={hasProcessedVideos}
          processedCount={displayCount}
          totalVideos={displayTotal}
          onViewVideos={() => setIsModalOpen(true)}
          showSuccessMessage={showSuccessMessage}
          steps={steps}
          completedSteps={completedSteps}
          totalSteps={totalSteps}
        />
      </div>

      <ProcessedVideosModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoUrls={videoUrls}
        processedCount={displayCount}
        status={status}
        progress={progress}
      />
    </div>
  );
};

export default ProcessingStatus;